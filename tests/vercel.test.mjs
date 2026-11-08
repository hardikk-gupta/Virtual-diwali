import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import handler from '../api/lanterns.js';

test('Vercel output contains the rendered page and every referenced local asset', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const html = readFileSync(config.outputDirectory + '/index.html', 'utf8');
  assert(!html.includes('/*SITE_JS*/'));
  assert(!html.includes('{{icon:'));
  for (const [, asset] of html.matchAll(/(?:src=["']|url\(["']?)(\/assets\/[^"')]+)["')]/g)) {
    assert(existsSync(config.outputDirectory + asset), asset);
  }
  assert(existsSync('dist/server/index.js'));
});

test('Vercel API forwards GET and POST, preserves errors, and rejects foreign origins', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(url, 'https://diwali-wishes.haha-hardikk.chatgpt.site/api/lanterns');
    assert.equal(options.headers.Origin, 'https://diwali-wishes.haha-hardikk.chatgpt.site');
    if (options.method === 'POST') {
      assert.equal(JSON.parse(options.body).name, 'Diya');
      return Response.json({ error: 'Try later' }, { status: 429 });
    }
    return Response.json({ lanterns: [], total: 51 });
  };
  const response = () => ({ setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } });
  try {
    let res = response();
    await handler({ method: 'GET', headers: { host: 'example.vercel.app' } }, res);
    assert.equal(res.code, 200);
    assert.equal(res.data.total, 51);
    res = response();
    await handler({ method: 'POST', headers: { host: 'example.vercel.app', origin: 'https://example.vercel.app' }, body: { name: 'Diya' } }, res);
    assert.equal(res.code, 429);
    res = response();
    await handler({ method: 'POST', headers: { host: 'example.vercel.app', origin: 'https://other.example' } }, res);
    assert.equal(res.code, 403);
    assert.equal(calls, 2);
    globalThis.fetch = async () => { throw Error('offline'); };
    res = response();
    await handler({ method: 'GET', headers: {} }, res);
    assert.equal(res.code, 503);
  } finally { globalThis.fetch = original; }
});
