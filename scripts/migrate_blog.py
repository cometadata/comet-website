#!/usr/bin/env python3
"""Migrate COMET blog posts from Squarespace RSS into Hugo content/posts/."""

from __future__ import annotations

import email.utils
import hashlib
import html
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT / "content" / "posts"
IMAGES_DIR = ROOT / "static" / "images" / "blog"
RSS_URL = "https://www.cometadata.org/blog?format=rss"
FEATURED_SLUG = "unlocking-author-affiliation-metadata-for-all-of-arxiv"
DEFAULT_CATEGORY = "News"

COMET_DOI_RE = re.compile(
    r'(<a\b(?![^>]*\bclass=)([^>]*?)href="https://doi\.org/(10\.7269/[^"]+)"([^>]*)>)',
    re.IGNORECASE,
)
COMET_DOI_CLASS_RE = re.compile(
    r'(<a\b([^>]*?)href="https://doi\.org/(10\.7269/[^"]+)"([^>]*)>)',
    re.IGNORECASE,
)
IMG_SRC_RE = re.compile(r'(<img\b[^>]*\bsrc=")([^"]+)("[^>]*>)', re.IGNORECASE)
ITEM_RE = re.compile(r"<item>(.*?)</item>", re.DOTALL | re.IGNORECASE)


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "comet-website-migration/1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def tag_text(block: str, name: str) -> str:
    match = re.search(rf"<{name}(?:[^>]*)><!\[CDATA\[(.*?)\]\]></{name}>", block, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    match = re.search(rf"<{name}(?:[^>]*)>(.*?)</{name}>", block, re.DOTALL | re.IGNORECASE)
    return html.unescape(match.group(1).strip()) if match else ""


def tag_all(block: str, name: str) -> list[str]:
    return [html.unescape(m.group(1).strip()) for m in re.finditer(rf"<{name}(?:[^>]*)>(.*?)</{name}>", block, re.DOTALL | re.IGNORECASE)]


def slug_from_link(link: str) -> str:
    return link.rstrip("/").rsplit("/", 1)[-1]


def parse_date(pub_date: str) -> str:
    dt = email.utils.parsedate_to_datetime(pub_date)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def safe_filename(url: str) -> str:
    path = urllib.parse.urlparse(url).path
    name = urllib.parse.unquote(path.rsplit("/", 1)[-1])
    name = re.sub(r"[^\w.\-]+", "-", name).strip("-")
    if not name or "." not in name:
        digest = hashlib.sha1(url.encode()).hexdigest()[:10]
        name = f"image-{digest}.jpg"
    return name


def download_image(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return
    # Prefer a reasonable width from Squarespace CDN.
    fetch_url = url
    if "squarespace-cdn.com" in url and "format=" not in url:
        fetch_url = f"{url}{'&' if '?' in url else '?'}format=1500w"
    data = fetch(fetch_url)
    dest.write_bytes(data)


def add_comet_doi_classes(content: str) -> str:
    def repl(match: re.Match[str]) -> str:
        tag = match.group(0)
        if "comet-doi" in tag:
            return tag
        if 'class="' in tag:
            return re.sub(r'class="([^"]*)"', r'class="\1 citation-link comet-doi"', tag, count=1)
        return tag[:-1] + ' class="citation-link comet-doi">'

    return COMET_DOI_CLASS_RE.sub(repl, content)


def localize_images(content: str, slug: str, downloaded: dict[str, str]) -> str:
    def repl(match: re.Match[str]) -> str:
        prefix, url, suffix = match.groups()
        if url.startswith("/images/blog/"):
            return match.group(0)
        if "squarespace-cdn.com" not in url and "static1.squarespace.com" not in url:
            return match.group(0)
        if url not in downloaded:
            filename = safe_filename(url)
            local_path = IMAGES_DIR / slug / filename
            try:
                download_image(url, local_path)
            except Exception as exc:  # noqa: BLE001
                print(f"  warning: failed to download {url}: {exc}", file=sys.stderr)
                return match.group(0)
            downloaded[url] = f"/images/blog/{slug}/{filename}"
        return f'{prefix}{downloaded[url]}{suffix}'

    return IMG_SRC_RE.sub(repl, content)


def toml_string(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def write_post(
    *,
    slug: str,
    title: str,
    date_iso: str,
    author: str,
    categories: list[str],
    summary: str,
    body_html: str,
    featured_media: str,
    featured: bool,
) -> None:
    cats = categories or [DEFAULT_CATEGORY]
    lines = [
        "+++",
        f"date = '{date_iso}'",
        "draft = false",
        f"title = {toml_string(title)}",
        f"slug = {toml_string(slug)}",
        f"authors = [{toml_string(author)}]",
        "categories = [" + ", ".join(toml_string(c) for c in cats) + "]",
        f"media = {toml_string(featured_media)}",
    ]
    if featured:
        lines.append("featured = true")
    lines.extend(["+++", ""])
    if summary:
        lines.append(summary.strip())
        lines.append("")
    lines.append("<!--more-->")
    lines.append("")
    lines.append(body_html.strip())
    lines.append("")

    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    (POSTS_DIR / f"{slug}.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    print(f"Fetching RSS from {RSS_URL}")
    rss = fetch(RSS_URL).decode("utf-8", errors="replace")
    items = ITEM_RE.findall(rss)
    print(f"Found {len(items)} posts")

    for block in items:
        title = tag_text(block, "title")
        link = tag_text(block, "link")
        slug = slug_from_link(link)
        author = tag_text(block, "dc:creator") or "COMET"
        pub_date = tag_text(block, "pubDate")
        date_iso = parse_date(pub_date)
        categories = [c for c in tag_all(block, "category") if c]
        summary = tag_text(block, "description")
        body = tag_text(block, "content:encoded")

        media_match = re.search(r'<media:content[^>]+url="([^"]+)"', block, re.IGNORECASE)
        featured_url = media_match.group(1) if media_match else ""
        featured_media = ""
        if featured_url:
            filename = safe_filename(featured_url)
            if filename.startswith("featured."):
                filename = f"featured-{filename}"
            if not filename.startswith("featured"):
                filename = f"featured-{filename}"
            local = IMAGES_DIR / slug / filename
            try:
                download_image(featured_url, local)
                featured_media = f"/images/blog/{slug}/{filename}"
            except Exception as exc:  # noqa: BLE001
                print(f"  warning: featured image failed for {slug}: {exc}", file=sys.stderr)

        downloaded: dict[str, str] = {}
        body = localize_images(body, slug, downloaded)
        body = add_comet_doi_classes(body)

        write_post(
            slug=slug,
            title=title,
            date_iso=date_iso,
            author=author,
            categories=categories,
            summary=summary,
            body_html=body,
            featured_media=featured_media,
            featured=slug == FEATURED_SLUG,
        )
        print(f"  migrated: {slug}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
