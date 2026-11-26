You are building a national statistics website entry for a make.fun bounty. The repository root is the current directory (/root/stats-entry).

HARD REQUIREMENTS (from the bounty rules - violating any fails the entry):
- The site is static files under app/ ONLY, no build step. app/index.html opens in desktop Chrome and at a phone size, works with no network request. Every script, stylesheet, font, image is a file under app/ (or data: URI). NO external URLs anywhere (no http/https references in html/js/css - not even in comments is safest, definitely none in src/href/import/url()). No fetch() to other origins; all data embedded in app/ JS files.
- Keep your own source split into small files with one clear job each, named for what they do (e.g. app/js/data-population.js, app/js/charts.js, app/js/render-nav.js). NO framework. Vanilla JS + SVG charts you write yourself. Keep the first load small (few files, few KB gzipped) - you may use dynamic import() for heavy pages, but prefer simplicity.
- Content: a rich national statistics site for INDONESIA (real figures from BPS/World Bank/other public sources, each figure with its source name and year shown). Pages/sections a visitor exploring a country's statistics needs: overview/key indicators dashboard, population & demographics, economy (GDP, inflation, trade), education, health, geography & climate, plus a compare-years feature and at least a couple of interactive controls (dropdowns/toggles/filters) that actually work. Every link must lead to a real working page; nothing empty, broken or placeholder. Charts: line/bar charts drawn as inline SVG from the data.
- Original design: your own palette/typography/layout, no copying another site's brand.
- Use hash-route or multi-file navigation via links. All pages reachable from a nav.
- index.html should stay lightweight: link a small style.css and one small main script; put page data in separate js files loaded as needed.
- app/ total under 16 MiB; index.html under 1 MiB; no symlinks; at most ~900 files (will be far fewer).

WHAT TO WRITE:
1. Replace the entire app/ directory content (it is currently empty) with your site. Do NOT touch vendor/ (contains makefun-frontend.ts which must stay unchanged), serve.ts, main.ts, LICENSE, shots.json. You may read main.ts and serve.ts to understand the layout.
2. After writing the site, run: node serve.ts --port 8099 (background) is NOT needed - instead verify by running: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts  (this copies app/ + screenshots/ to out/ and writes out/dossier.json). Check it exits cleanly and out/dossier.json exists. If it errors, fix and rerun.
3. Iterate: re-read your HTML/JS for broken links, missing files, empty sections, any absolute http(s) URL in app/ (search for "http" in app/ files and remove external references). Run the main.ts check again after fixes. Revise at least 2 files across separate messages (a file must be edited at least twice across the session).

Write everything yourself; do not download or copy code from anywhere. Work step by step, finish with the main.ts check passing.