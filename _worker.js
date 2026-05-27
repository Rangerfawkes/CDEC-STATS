// Cloudflare Worker entry point — handles /api/data, passes everything else to static assets.
// The JSONBIN_KEY is read from a Workers/Pages environment variable.
const BIN_ID = '6a164784f47d5c455c3b5339';
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/data') {
      if (!env.JSONBIN_KEY) {
        return new Response(
          JSON.stringify({ error: 'Server is missing JSONBIN_KEY env var.' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (request.method === 'GET') {
        const res = await fetch(BIN_URL + '/latest', {
          headers: { 'X-Master-Key': env.JSONBIN_KEY, 'X-Bin-Meta': 'false' }
        });
        const text = await res.text();
        return new Response(text, {
          status: res.status,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        });
      }

      if (request.method === 'PUT') {
        const body = await request.text();
        const res = await fetch(BIN_URL, {
          method: 'PUT',
          headers: { 'X-Master-Key': env.JSONBIN_KEY, 'Content-Type': 'application/json' },
          body
        });
        const text = await res.text();
        return new Response(text, {
          status: res.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response('Method not allowed', { status: 405 });
    }

    // Everything else → static assets (index.html, etc.)
    return env.ASSETS.fetch(request);
  }
};
