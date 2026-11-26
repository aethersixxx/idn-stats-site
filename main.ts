// A working best-national-statistics-site entry (Node 22, standard library only): the site is this directory's app/
// folder, an Indonesia national statistics site whose hash-routed pages are Ringkasan, Populasi, Ekonomi, Pendidikan,
// Kesehatan, Geografi, and Bandingkan. It is plain static files a browser opens at app/index.html (ES modules, CSS,
// no build step), with all of its content held in its own files: nothing it runs, styles or shows loads over the
// network. The program hands it in: it copies app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads (your screenshots, the first load's files and bytes, and your
// source), with the vendored make.fun library. Leave vendor/makefun-frontend.ts as it is: the scorer requires
// dossier.json to be byte for byte what its own copy writes.
//
// This is the finished entry for make.fun bounty best-national-statistics-site-20261126-0539: app/ holds the running
// site and screenshots/ its PNG or JPEG captures (shots.json says which views those captures were taken of).
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const ENTRY_TITLE = 'Statistik Indonesia — make.fun bounty best-national-statistics-site-20261126-0539';
console.log(ENTRY_TITLE);

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 16 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
