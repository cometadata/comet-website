
![release] 
[![GitHub Pages](https://github.com/cometadata/comet-website/actions/workflows/hugo.yml/badge.svg)](https://github.com/cometadata/comet-website/actions/workflows/hugo.yml)
![githubissues] 
![githublastcommitmain]
![githublastcommitdevelopment]

# COMET website
A fast, static website built using the [Hugo](https://gohugo.io/) framework.

## Deployment

This site automatically deploys to **GitHub Pages** via GitHub Actions when changes merge to `main`.

- Workflow: `.github/workflows/hugo.yml`
- Production URL: [https://www.cometdata.org/](https://www.cometdata.org/)
- Custom domain: `static/CNAME` → `www.cometdata.org`
- Deployment status: **Actions** tab on this repository

Production builds use:

```bash
hugo --minify -b 'https://www.cometdata.org/'
```

Local preview: `./scripts/dev-server.sh` (see `docs/content-editors-guide.md`).

[githubissues]: https://img.shields.io/github/issues-raw/cometadata/comet-website
[githublastcommitmain]: https://img.shields.io/github/last-commit/cometadata/comet-website/main?label=last%20commit%20main
[githublastcommitdevelopment]: https://img.shields.io/github/last-commit/cometadata/comet-website/development?label=last%20commit%20development
[release]: https://img.shields.io/github/v/release/cometadata/comet-website
[releasetag]: https://img.shields.io/github/v/tag/cometadata/comet-website
