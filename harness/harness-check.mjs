#!/usr/bin/env node
// harness-check — report-only hard checks for a live site.
// Usage: node harness-check.mjs <baseUrl> [path ...] [--out dir] [--widths 320,375,430,1440]
//        [--known harness/known-issues.json] [--full] [--no-links]
// Checks per path x width: broken images, horizontal overflow, aspect ratio reserved on img/video,
// console errors. Per path: links 404/410, favicon + manifest. Screenshots + report.json in --out.
// Exit 1 if any failure that is not matched by a known-issues entry (substring match on the message).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const flag = (k) => { const i = argv.indexOf(k); if (i < 0) return false; argv.splice(i, 1); return true; };
const outDir = opt('--out', './harness-out');
const widths = opt('--widths', '320,375,430,1440').split(',').map(Number);
const knownFile = opt('--known', '');
const full = flag('--full');
const noLinks = flag('--no-links');
const [base, ...rawPaths] = argv;
if (!base) { console.error('usage: harness-check.mjs <baseUrl> [paths...]'); process.exit(2); }
const paths = rawPaths.length ? rawPaths : ['/'];
const known = knownFile && fs.existsSync(knownFile) ? JSON.parse(fs.readFileSync(knownFile, 'utf8')) : [];
fs.mkdirSync(outDir, { recursive: true });

const failures = [];
const warnings = [];
const fail = (check, where, msg) => failures.push({ check, where, msg, known: known.some(k => (check + ' ' + msg).includes(k)) });
const warn = (check, where, msg) => warnings.push({ check, where, msg });
const abs = (u) => new URL(u, base).href;
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const extraHeaders = bypass ? { 'x-vercel-protection-bypass': bypass } : {};

async function status(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 harness-check', ...(url.startsWith(new URL(base).origin) ? extraHeaders : {}) }, signal: AbortSignal.timeout(15000) });
      if (method === 'HEAD' && [403, 405, 404, 410, 501].includes(r.status)) continue; // some hosts reject HEAD
      return r.status;
    } catch (e) { if (method === 'GET') return 'ERR ' + (e.cause?.code || e.name); }
  }
}
async function pool(items, n, fn) { const q = [...items]; await Promise.all(Array.from({ length: n }, async () => { while (q.length) await fn(q.shift()); })); }

const launch = { headless: true };
if (process.env.CHROME_PATH) launch.executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch(launch);
const linkSet = new Map(); // href -> first page seen
const report = { base, paths, widths, startedAt: new Date().toISOString(), pages: [] };

for (const p of paths) {
  const url = abs(p);
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, extraHTTPHeaders: extraHeaders, isMobile: w < 800, hasTouch: w < 800 });
    const page = await ctx.newPage();
    const where = `${p} @${w}`;
    const consoleErrors = []; const badMedia = new Set();
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
    page.on('pageerror', e => consoleErrors.push('pageerror: ' + String(e.message).slice(0, 300)));
    page.on('response', r => { const t = r.request().resourceType(); if ((t === 'image' || t === 'media') && r.status() >= 400) badMedia.add(`${r.status()} ${r.url()}`); });
    let navStatus;
    try {
      const resp = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
      navStatus = resp?.status();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      // scroll through to trigger lazy media, then back to top
      await page.evaluate(async () => { const h = () => document.documentElement.scrollHeight; for (let y = 0; y < h() && y < 30000; y += innerHeight * 0.8) { scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } scrollTo(0, 0); });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(800);
    } catch (e) { fail('navigation', where, String(e.message).split('\n')[0]); }
    if (navStatus && navStatus >= 400) fail('navigation', where, `HTTP ${navStatus}`);

    const r = await page.evaluate(() => {
      const de = document.documentElement;
      scrollTo(200, scrollY); const sx = scrollX; scrollTo(0, scrollY);
      const overflow = sx > 0 ? Math.max(sx, de.scrollWidth - de.clientWidth) : 0; // only counts if the page really scrolls sideways
      const clipped = de.scrollWidth - de.clientWidth;
      const offenders = overflow > 1 ? [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > de.clientWidth + 1 && getComputedStyle(el).position !== 'fixed').slice(0, 5).map(el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')) : [];
      const broken = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && (i.currentSrc || i.src)).map(i => i.currentSrc || i.src);
      const noAspect = [...document.querySelectorAll('img,video')].filter(el => {
        const cs = getComputedStyle(el);
        if (el.offsetWidth === 0 || cs.display === 'none' || cs.visibility === 'hidden') return false;
        if (el.getAttribute('width') && el.getAttribute('height')) return false;
        if (cs.aspectRatio && cs.aspectRatio !== 'auto') return false;
        if (cs.position === 'absolute' || cs.position === 'fixed') return false; // parent box reserves space (next/image fill)
        if (el.offsetWidth < 48 && el.offsetHeight < 48) return false; // icons
        for (let a = el.parentElement, i = 0; a && i < 2; a = a.parentElement, i++) { const ac = getComputedStyle(a); if (ac.aspectRatio && ac.aspectRatio !== 'auto') return false; }
        if (cs.objectFit && cs.objectFit !== 'fill' && el.style.height) return false;
        return true;
      }).slice(0, 20).map(el => el.tagName.toLowerCase() + ' ' + (el.currentSrc || el.src || el.getAttribute('poster') || '').slice(0, 160));
      const links = [...document.querySelectorAll('a[href]')].map(a => a.href).filter(h => /^https?:/.test(h));
      const icon = document.querySelector('link[rel~="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"]')?.href || null;
      const manifest = document.querySelector('link[rel="manifest"]')?.href || null;
      return { overflow, clipped, offenders, broken, noAspect, links, icon, manifest };
    }).catch(e => ({ error: String(e.message) }));

    const shot = path.join(outDir, `${p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home'}-${w}.png`);
    await page.screenshot({ path: shot, fullPage: full }).catch(() => {});
    if (!r.error) {
      if (r.overflow > 1) fail('overflow', where, `horizontal overflow ${r.overflow}px (${r.offenders.join(', ')})`);
      if (!r.overflow && r.clipped > 1) warn('overflow-clipped', where, `content ${r.clipped}px wider than viewport but clipped (no sideways scroll)`);
      for (const b of new Set([...r.broken])) fail('broken-image', where, `naturalWidth 0: ${b}`);
      // a failed media request that the page recovered from (fallback src) is a warning, not a broken image
      for (const b of badMedia) { const u = b.split(' ').slice(1).join(' '); if (r.broken.includes(u)) continue; warn('media-request', where, `HTTP ${b} (recovered by fallback)`); }
      for (const a of r.noAspect) fail('aspect-ratio', where, `no reserved aspect ratio: ${a}`);
      for (const c of [...new Set(consoleErrors)]) { if (/^Failed to load resource/.test(c) && badMedia.size && !r.broken.length) { warn('console-error', where, c); continue; } fail('console-error', where, c); }
      if (w === widths[widths.length - 1] || w === 1440) {
        for (const l of r.links) { const u = l.split('#')[0]; if (!linkSet.has(u)) linkSet.set(u, p); }
        const iconUrl = r.icon || abs('/favicon.ico');
        const is = await status(iconUrl); if (is !== 200) fail('favicon', p, `favicon ${iconUrl} -> ${is}`);
        if (!r.manifest) fail('manifest', p, 'no <link rel="manifest">');
        else { const ms = await status(r.manifest); if (ms !== 200) fail('manifest', p, `manifest ${r.manifest} -> ${ms}`); }
      }
    }
    report.pages.push({ path: p, width: w, navStatus, screenshot: shot, overflow: r.overflow, consoleErrors: consoleErrors.length, error: r.error });
    await ctx.close();
  }
}
await browser.close();

if (!noLinks) {
  report.linksChecked = linkSet.size;
  await pool([...linkSet.keys()], 8, async (u) => { const s = await status(u); if (s === 404 || s === 410) fail('dead-link', linkSet.get(u), `${s} ${u}`); });
}
report.failures = failures;
report.warnings = warnings;
report.newFailures = failures.filter(f => !f.known).length;
report.knownFailures = failures.filter(f => f.known).length;
report.finishedAt = new Date().toISOString();
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));

const group = (list) => { const g = new Map(); for (const f of list) { const k = f.check + '\u0000' + f.msg; const e = g.get(k) || { ...f, where: [] }; e.where.push(f.where); g.set(k, e); } return [...g.values()]; };
console.log(`harness-check ${base} — ${paths.length} path(s) x ${widths.length} widths, ${report.linksChecked ?? 0} links`);
for (const [label, list] of [['FAIL', failures], ['warn', warnings]]) {
  const byCheck = {}; for (const f of group(list)) (byCheck[f.check] ||= []).push(f);
  for (const [c, items] of Object.entries(byCheck)) { console.log(`\n${label === 'FAIL' ? '✗' : '!'} ${c} (${items.length} unique)`); for (const f of items.slice(0, 15)) console.log(`  ${f.known ? '[known] ' : ''}${f.msg}  — ${f.where.join(', ')}`); if (items.length > 15) console.log(`  … ${items.length - 15} more in report.json`); }
}
console.log(`\n${report.newFailures ? 'FAIL' : 'PASS'}: ${report.newFailures} new, ${report.knownFailures} known, ${warnings.length} warnings. Report: ${path.join(outDir, 'report.json')}`);
process.exit(report.newFailures ? 1 : 0);
