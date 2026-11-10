const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { Readable } = require('node:stream');

const root = path.resolve(__dirname, '../多多谷官網');
const source = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const text = '甚至當場死亡！準備出發，變節者奧茲 🌟𠮷';

// Run the real handlers, with no listening socket or external database writes.
function fixture() {
  const writes = [];
  const context = vm.createContext({
    Buffer, URL, console, __dirname: root,
    process: { env: {
      ADMIN_USERNAME: text, ADMIN_PASSWORD: text,
      SUPABASE_URL: 'https://database.invalid', SUPABASE_SECRET_KEY: 'test-only'
    } },
    require(name) {
      if (name === 'http') return { createServer: () => ({ listen() {} }) };
      if (name === 'fs') return { existsSync: () => true };
      if (name === './dd-traffic-server') return { createTrafficHandlers: () => ({}) };
      if (name === './dd-bgm-traffic-server') return { createBgmTrafficHandlers: () => ({}) };
      if (name === 'path' || name === 'crypto') return require(name);
      throw new Error(`Unexpected dependency: ${name}`);
    },
    async fetch(url, options = {}) {
      assert.ok(url.startsWith('https://database.invalid/'));
      let rows = [];
      if (options.method === 'POST') {
        writes.push({ url, body: options.body });
        if (url.includes('/rest/v1/')) rows = JSON.parse(options.body);
      }
      return { ok: true, status: 200, json: async () => rows,
        text: async () => JSON.stringify(rows) };
    }
  });
  vm.runInContext(source, context, { filename: 'server.js' });
  vm.runInContext("adminSessions.set('test-token', {createdAt:Date.now(),lastActivityAt:Date.now()})", context);
  return { context, writes };
}

function request(context, handler, chunks) {
  return new Promise((resolve, reject) => {
    const req = Readable.from(chunks, { objectMode: false });
    req.headers = { authorization: 'Bearer test-token' };
    req.socket = { remoteAddress: '127.0.0.1' };
    req.on('error', reject);
    const res = {
      status: 200,
      setHeader() {},
      writeHead(status) { this.status = status; return this; },
      end(body) { resolve({ status: this.status, body: JSON.parse(body) }); }
    };
    Promise.resolve(context[handler](req, res)).catch(reject);
  });
}

function partitions(payload) {
  const bytes = Buffer.from(JSON.stringify(payload));
  const cases = [[bytes], Array.from(bytes, byte => Buffer.from([byte]))];
  // Every possible two-chunk split, including the interior of 3/4-byte characters.
  for (let i = 1; i < bytes.length; i++) cases.push([bytes.subarray(0, i), bytes.subarray(i)]);
  return cases;
}

test('Chinese login credentials survive every UTF-8 chunk boundary', { timeout: 10000 }, async () => {
  const { context } = fixture();
  for (const chunks of partitions({ username: text, password: text })) {
    const result = await request(context, 'handleAdminLogin', chunks);
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
  }
});

for (const [handler, payload, readSaved] of [
  ['handleSaveEvents', { events: [{ id: 'event-1', title: text, detail: text,
    sectionBlocks: [{ body: text }] }] }, rows => rows.map(row => row.data)],
  ['handleSaveBosses', { bosses: [{ name: text, description: text }], interval: 5000 },
    rows => rows[0].data.bosses],
  ['handleSaveSiteData', { values: { duoduo_pools: [{ items: [{ name: text }] }] } },
    rows => rows[0].data.values]
]) {
  test(`${handler} preserves nested Chinese and emoji at every boundary`, { timeout: 10000 }, async () => {
    const { context, writes } = fixture();
    const expected = payload.events || payload.bosses || payload.values;
    for (const chunks of partitions(payload)) {
      writes.length = 0;
      const result = await request(context, handler, chunks);
      assert.equal(result.status, 200);
      assert.equal(writes.length, 1);
      assert.deepEqual(readSaved(JSON.parse(writes[0].body)), expected);
    }
  });
}

test('image upload sanitizes the original filename and preserves binary content', { timeout: 10000 }, async () => {
  const { context, writes } = fixture();
  const payload = { filename: '活動🌟.png', dataUrl: 'data:image/webp;base64,AQIDBA==' };
  for (const chunks of partitions(payload)) {
    writes.length = 0;
    const result = await request(context, 'handleUpload', chunks);
    assert.equal(result.status, 200);
    assert.match(result.body.path, /\/\d+_[a-z0-9]+_____\.webp$/);
    assert.deepEqual(writes[0].body, Buffer.from([1, 2, 3, 4]));
  }
});

test('large event payload preserves a character split at the 64 KiB boundary', { timeout: 10000 }, async () => {
  const { context, writes } = fixture();
  const prefixLength = Buffer.byteLength('{"events":[{"id":"large","detail":"');
  const payload = { events: [{ id: 'large', detail: 'a'.repeat(65535 - prefixLength) + text.repeat(1000) }] };
  const bytes = Buffer.from(JSON.stringify(payload));
  const firstCharacter = bytes.indexOf(Buffer.from('甚'));
  const split = firstCharacter + 1;
  assert.equal(split, 65536);
  const result = await request(context, 'handleSaveEvents', [bytes.subarray(0, split), bytes.subarray(split)]);
  assert.equal(result.status, 200);
  assert.deepEqual(JSON.parse(writes[0].body)[0].data, payload.events[0]);
});
