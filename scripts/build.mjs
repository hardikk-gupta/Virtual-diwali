import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
rmSync('dist', { recursive: true, force: true });
rmSync('public', { recursive: true, force: true });
for (const dir of ['public/assets', 'public/resources/images', 'public/resources/fonts', 'public/resources/audio']) mkdirSync(dir, { recursive: true });
mkdirSync('dist/server', { recursive: true });
mkdirSync('dist/.openai', { recursive: true });
const html = readFileSync('web/index.html', 'utf8');
// Inline the Hallmark scaffold (tokens, then base) where style.css imports it, after the stamp.
const css = readFileSync('web/style.css', 'utf8')
  .replace('@import url("./tokens.css");', () => readFileSync('web/tokens.css', 'utf8'))
  .replace('@import url("./base.css");', () => readFileSync('web/base.css', 'utf8'));
const js = readFileSync('web/app.js', 'utf8');
const page = html.replace(/\{\{icon:([a-z0-9-]+)\}\}/g, (_, name) =>
  readFileSync('resources/icons/' + name + '.svg', 'utf8').replace('<svg', '<svg class="icon" aria-hidden="true"')
).replace('/*SITE_CSS*/', css).replace('/*SITE_JS*/', js);
// Everything the page loads lives in resources/ and is served at the same path.
const served = [
  'images/rooftop-sky.webp', 'images/rocket.webp', 'images/lantern.webp', 'images/diwali-share.jpg',
  'fonts/gloock.woff2', 'fonts/geist.woff2',
  'audio/diwali-instrumental.mp3'
];
const assets = {};
for (const file of served) assets['/resources/' + file] = readFileSync('resources/' + file).toString('base64');
// Stable public URLs already used by social previews and earlier shares.
assets['/assets/diwali-share.jpg'] = assets['/resources/images/diwali-share.jpg'];
assets['/assets/diwali-preview-2026.jpg'] = assets['/resources/images/diwali-share.jpg'];
const api = readFileSync('worker/api.js', 'utf8').replace('export async function api', 'async function api');
const out = api + '\nconst PAGE=' + JSON.stringify(page) + ';\nconst ASSETS=' + JSON.stringify(assets) + `;
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path.startsWith('/api/')) return api(request, env);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    const head = request.method === 'HEAD';
    if (path === '/robots.txt') {
      return new Response(head ? null : 'User-agent: *\\nAllow: /\\n', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
      });
    }
    if (ASSETS[path]) {
      const bytes = Uint8Array.from(atob(ASSETS[path]), c => c.charCodeAt(0));
      return new Response(head ? null : bytes, { headers: {
        'Content-Type': path.endsWith('.mp3') ? 'audio/mpeg' : path.endsWith('.woff2') ? 'font/woff2' : path.endsWith('.jpg') ? 'image/jpeg' : 'image/webp',
        'Content-Length': String(bytes.byteLength),
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff'
      } });
    }
    if (!['/', '/index.html', '/diwali', '/diwali/'].includes(path)) {
      return new Response(head ? null : 'Not found', { status: 404 });
    }
    return new Response(head ? null : PAGE, { headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"
    } });
  }
};`;
writeFileSync('dist/server/index.js', out);
writeFileSync('dist/.openai/hosting.json', readFileSync('.openai/hosting.json'));
console.log('Built worker with ' + Object.keys(assets).length + ' assets.');


// Vercel serves the same page and assets; Sites retains its Worker bundle.
writeFileSync('public/index.html', page);
writeFileSync('public/robots.txt', 'User-agent: *\nAllow: /\n');
for (const [url, data] of Object.entries(assets)) writeFileSync('public' + url, Buffer.from(data, 'base64'));
