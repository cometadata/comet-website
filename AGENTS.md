# Agent notes — COMET website

Guidance for AI agents and developers working on this Hugo site locally.

## Local dev server

| Item | Value |
|---|---|
| Default URL | http://127.0.0.1:1313/ |
| Default port | `1313` |
| Theme | `comet-theme` |
| Config | `hugo.toml` + `config/development/hugo.toml` (dev overrides) |

### Start the dev server

1. **Check whether a server is already running** — do not start a second one.

```bash
pgrep -fl "hugo server"
lsof -nP -iTCP:1313 -sTCP:LISTEN
```

2. **If nothing is listening on 1313**, start the server:

```bash
./scripts/dev-server.sh
```

Equivalent manual command:

```bash
hugo server -D --port 1313 --bind 127.0.0.1 --disableFastRender --environment development
```

3. Open http://127.0.0.1:1313/ and hard-refresh if styles look stale.

### Stop the dev server

```bash
pkill -f "hugo server"
```

## If CSS or assets look broken locally

This usually happens when a **production build** wrote to `public/` while the dev server was running, or when asset URLs point at `https://example.org/` instead of localhost.

**Fix:**

1. Stop the dev server: `pkill -f "hugo server"`
2. Clear and rebuild: `./scripts/dev-rebuild.sh`
3. Start again: `./scripts/dev-server.sh` (runs an initial `hugo` build so Sass is compiled to `public/css/style.css`)
4. Hard-refresh the browser

**Do not** run bare `hugo server` without the initial build step — Sass may not be written to `public/css/style.css` on first start, which causes a 404 and an unstyled site.

**Verify CSS is loading correctly:**

```bash
curl -s http://127.0.0.1:1313/ | grep -o 'href="[^"]*style[^"]*"'
```

Expected in dev: `href="/css/style.css"` (root-relative, not `https://example.org/...`).

### Why this happens

- Root `hugo.toml` sets `baseURL = 'https://example.org/'` and `canonifyURLs = true` for generic builds.
- `config/development/hugo.toml` overrides this for `hugo server` (`http://localhost:1313/`, `canonifyURLs = false`).
- Running `hugo` or `hugo --minify` **while the dev server is running** can overwrite `public/` with production URLs and break local styling until a clean restart.

**Rule:** stop the dev server before running a production build locally.

## Production / CI build

GitHub Pages build (matches CI):

```bash
pkill -f "hugo server" 2>/dev/null || true
hugo --minify -b 'https://cometadata.github.io/comet-website/'
```

Output goes to `public/`. Do not serve this output with `hugo server` without clearing first — use `./scripts/dev-rebuild.sh` then `./scripts/dev-server.sh`.

## Hugo hot reload

The dev server watches templates, data, assets, and config. Use `--disableFastRender` (already in `dev-server.sh`) for reliable full rebuilds after template changes.

If the server panics on hot reload (known Hugo 0.161 issue), stop and restart with `./scripts/dev-server.sh`.

## Key paths

| Purpose | Path |
|---|---|
| Site config | `hugo.toml` |
| Dev config overrides | `config/development/hugo.toml` |
| Join Us form data | `data/join_us/form.yaml` |
| Join Us thank-you copy | `data/join_us/thank_you.yaml` |
| Base layout / assets | `themes/comet-theme/layouts/_default/baseof.html` |
| Local asset URL helper | `themes/comet-theme/layouts/partials/local-asset.html` |

## Join Us / Mailchimp

See `docs/join-us-mailchimp-form.md`.
