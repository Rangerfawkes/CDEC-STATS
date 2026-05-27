// Cloudflare Pages Function — proxies JSONBin so the API key never reaches the browser.
// Route: /api/data
// GET  → fetch latest record from JSONBin
// PUT  → overwrite the bin with the posted JSON body
// The JSONBIN_KEY is read from a Pages environment variable (Settings → Environment variables).

const BIN_ID = '6a164784f47d5c455c3b5339';
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export async function onRequest(context) {
  const { request, env } = context;

  if (!env.JSONBIN_KEY) {
    return new Response(
      JSON.stringify({ error: 'Server is missing JSONBIN_KEY env var.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (request.method === 'GET') {
    const res = await fetch(BIN_URL + '/latest', {
      headers: {
        'X-Master-Key': env.JSONBIN_KEY,
        'X-Bin-Meta': 'false'
      }
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  }

  if (request.method === 'PUT') {
    const body = await request.text();
    const res = await fetch(BIN_URL, {
      method: 'PUT',
      headers: {
        'X-Master-Key': env.JSONBIN_KEY,
        'Content-Type': 'application/json'
      },
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
