#!/usr/bin/env python3
"""Remove leading indentation from HTML blocks in blog post bodies.

Goldmark treats indented lines as fenced code blocks, which breaks migrated
Squarespace figure markup.
"""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT / "content" / "posts"


def normalize_body(body: str) -> str:
    lines = body.split("\n")
    out: list[str] = []
    i = 0

    while i < len(lines):
        line = lines[i]

        if not line.strip():
            out.append("")
            i += 1
            continue

        if line.startswith((" ", "\t")) and "<" in line:
            block: list[str] = []
            while i < len(lines):
                current = lines[i]
                if not current.strip():
                    block.append("")
                    i += 1
                    continue
                if current.startswith((" ", "\t")) or (
                    block and not current.lstrip().startswith("<") and block[-1].strip()
                ):
                    block.append(current)
                    i += 1
                    continue
                break

            for entry in block:
                out.append(entry.lstrip() if entry.strip() else "")
            continue

        if line.lstrip().startswith("<"):
            out.append(line.lstrip())
        else:
            out.append(line)
        i += 1

    return "\n".join(out)


def fix_post(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if "<!--more-->" not in text:
        return False

    front, body = text.split("<!--more-->", 1)
    normalized = normalize_body(body)
    if normalized == body:
        return False

    path.write_text(f"{front}<!--more-->{normalized}", encoding="utf-8")
    return True


def main() -> int:
    changed = 0
    for path in sorted(POSTS_DIR.glob("*.md")):
        if fix_post(path):
            print(f"fixed: {path.name}")
            changed += 1
    print(f"Updated {changed} posts")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
