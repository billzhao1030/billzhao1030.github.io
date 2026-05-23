# MarkerHarness — public landing page

Single-page static site for `MarkerHarness` (the multi-agent assignment grading harness).
This directory is **fully static** — no backend required. The fuzzy-name-matcher demo runs
entirely in the browser (pure JS port of the Python module).

Deployed at: **https://billzhao1030.github.io/MarkerHarness/**

## Files

- `index.html` — landing page (hero, key features, pipeline, live demo, 9 collapsible docs cards, quickstart, citation)
- `style.css` — light theme, no third-party CSS framework
- `script.js` — name-matcher (pure JS port of `markerHarness/name_match.py`) + demo widget + scroll animation
- `LICENSE` — MIT
- `README.md` — this file

## Local preview

GitHub Pages serves this over HTTPS at the URL above (no port involved). For local preview before pushing:

```bash
# from anywhere
python3 -m http.server 4173 --bind 127.0.0.1 \
  --directory /home/xunyi/Desktop/Projects/billzhao1030.github.io/MarkerHarness
# → open http://localhost:4173/
```

Stop with Ctrl-C. (Port 4173 has no significance to GitHub Pages itself — it's just a
convenient local-preview port that mirrors Vite's default.)

## Source repo

The actual MarkerHarness code lives in a sibling repo (`MLLM-Server/markerHarness/`). This
directory only contains the marketing landing page and a JS-only mirror of the name
matcher (for the demo widget).
