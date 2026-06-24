# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**365orthodoxy** — static, multilingual (Greek / English) marketing landing site for the
*365orthodoxy* widget: a digital Orthodox calendar showing the Saint of the day, movable
feasts, and spiritual quotes. The live widget itself is a separate app embedded via iframe
(`https://bible-quotes-widget.pages.dev`); **this repo is only the promotional site** that
collects email signups for the upcoming launch.

- Production domain: `https://365orthodoxy.com`
- Hosting: static host with Netlify-style `_redirects` / `_headers` (Cloudflare Pages / Netlify).
- No backend, no framework, no build step for the pages — plain HTML/CSS/JS.

## Tech stack

- Hand-written HTML, CSS, and vanilla JavaScript (no framework, no bundler).
- Minification only: Babel (transpile) + Terser (JS) + clean-css (CSS).
- Playwright for cross-browser E2E tests.
- Self-hosted fonts in `fonts/` plus Google Fonts (Montserrat, GFS Didot, Space Grotesk).

## Layout

| Path | Purpose |
|------|---------|
| `index.html` | Greek homepage (`lang="el"`) — the canonical root `/` |
| `en.html` | English homepage, served at `/en` |
| `privacy.html` / `privacy-en.html` | Privacy policy (EL / EN) |
| `success.html` | Post-signup thank-you page (`noindex`) |
| `style.css` → `style.min.css` | Source / minified styles |
| `script.js` → `script.min.js` | Source / minified behavior |
| `translations/el.json`, `en.json` | `data-i18n` string tables |
| `assets/` | `logo.png`, `favicon.png`, `mockups/*.webp` |
| `fonts/` | Self-hosted font files (Montserrat, GFS Didot, GFS Heraklit) |
| `_redirects` | Host rewrite/redirect rules (clean URLs, www→apex) |
| `_headers` | Security headers (CSP, HSTS) + cache-control |
| `robots.txt`, `sitemap.xml`, `llms.txt` | SEO / crawler files |
| `tests/e2e/` | Playwright specs |
| `backup/`, `project_backup.zip` | Snapshots — **do not edit** |

## What `script.js` does

All client behavior lives in one file, wired up on `DOMContentLoaded`:

- **i18n** — `data-i18n` elements are filled from `translations/<lang>.json`. The HTML pages
  are pre-rendered per language; JS only patches a few dynamic strings and remembers
  `preferredLang` in `localStorage`.
- **Header date** — localized current date (`el-GR` / `en-US`).
- **Live widget preview** — `initWidgetPreview()` reveals the embedded Flutter widget iframe
  (fades it in, hides the skeleton shimmer) on `load`, with a 5s fallback so it never stays hidden.
- **Lightbox** — mockup gallery (open/close, Esc, backdrop click).
- **Obfuscated email** — builds `mailto:` from `data-user` + `data-domain` to fight scrapers.
- **Cookie consent banner**, **dynamic copyright year**, **subscribe-form submit guard**,
  **scroll reveal** (IntersectionObserver), **glow parallax** (desktop pointer only).

`localStorage` access is always wrapped in `safeStorageGet/Set` (private-mode safe).

The **FAQ** (homepage `#faq`) is a pure-CSS native `<details>` accordion — no JS.

## Design system

`style.css` uses tokens in `:root` — spacing (`--space-*`), radius (`--radius-*`), restrained
gold lines (`--gold-line*`), and a shared easing curve (`--ease-premium`). Reuse these rather
than hardcoding values. The embedded widget (`.demo-section`, placed right after the hero) is a
**square** (`aspect-ratio: 1 / 1`) framed iframe — the Flutter widget fills whatever size it is
given, so its shape is controlled entirely by that ratio.

## Commands

```bash
# Minify CSS + JS into *.min.* (run before deploy / when source changes)
npm run build:minify
npm run build:clean:minify   # clean first, then minify

# E2E tests (auto-starts `npx serve -s . -l 4173`)
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:install         # install chromium + firefox
npm run test:e2e:install:webkit  # webkit separately

# Serve locally (what Playwright uses)
npx serve -s . -l 4173
```

CI: `.github/workflows/e2e-matrix.yml` runs the Playwright matrix (Chromium, Firefox, WebKit +
iPhone 13 / Pixel 5 profiles) on every push and PR.

## Conventions & gotchas

- **CSS loads minified, JS loads from source.** The pages link `style.min.css` but
  `script.js` (not `script.min.js`). So after editing `style.css` you **must** run
  `npm run minify:css` (or `build:minify`) for the change to show; editing `script.js` is live
  immediately. `script.min.js` is still built but currently unused by the pages.
- **Cache-busting** is a manual query string (e.g. `style.min.css?v=20260624e`). Bump it in
  every HTML file when you ship a CSS change, since `style.min.css` is served `immutable`.
- **Keep EL and EN in sync.** A content change in `index.html` usually needs the mirror in
  `en.html` (and the same for `privacy*.html` / `translations/*.json`).
- **CSP is strict** (`_headers`): `connect-src 'self'`, `frame-src` only allows the widget
  origin, scripts are `'self' 'unsafe-inline'`. Adding an external script, font, API call, or
  iframe means updating the CSP, or it will be blocked.
- **SEO is hand-maintained**: canonical + `hreflang` (el / en / x-default), Open Graph, Twitter
  cards, and JSON-LD (Organization, WebSite, **FAQPage**) live in each page `<head>`. The
  FAQPage answers must mirror the visible `#faq` text. New pages need matching `sitemap.xml`,
  `_redirects`, and hreflang entries. `success.html` stays `noindex`.
- Clean URLs are produced by `_redirects` (`/en` → `en.html`, `/privacy` → `privacy.html`, …),
  so link to the extensionless paths.
- `backup/` and `project_backup.zip` are historical snapshots — never modify them.
