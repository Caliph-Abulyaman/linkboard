const test = require('node:test');
const assert = require('node:assert/strict');

const API_URL = process.env.API_URL || 'http://localhost:4000';

// Randomized per run so repeated runs against a persistent Postgres
// volume don't collide on the unique email constraint.
const email = `test-${Date.now()}@example.com`;
const password = 'test-password-123';

// Stable, always-fetchable URL — the worker will actually GET this
// and parse its <title>, so it needs to be real.
const linkUrl = 'https://example.com';

function extractCookie(response) {
    const setCookie = response.headers.get('set-cookie');
    if (!setCookie) {
        throw new Error('login response had no Set-Cookie header');
    }
    // Only need the cookie's name=value pair, not the attributes
    // (HttpOnly, SameSite, etc.) that follow the first semicolon.
    return setCookie.split(';')[0];
}

async function waitForEnrichment(linkId, cookie, timeoutMs = 10000) {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        const res = await fetch(`${API_URL}/links`, {
            headers: { Cookie: cookie },
        });
        const links = await res.json();
        const link = links.find((l) => l.id === linkId);

        if (link && link.title) {
            return link;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error(`link ${linkId} was not enriched within ${timeoutMs}ms`);
}

test('signup creates a new user', async () => {
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    assert.equal(res.status, 201);
});

test('login returns a session cookie', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    assert.equal(res.status, 200);
    assert.ok(res.headers.get('set-cookie'), 'expected a Set-Cookie header');
});

test('full flow: post a link, it appears unenriched, then the worker enriches it', async () => {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const cookie = extractCookie(loginRes);

    const createRes = await fetch(`${API_URL}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({ url: linkUrl }),
    });
    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    assert.equal(created.title, null, 'link should not be enriched yet at creation time');

    // Proves the async path actually ran end-to-end: api enqueued via
    // Redis, worker dequeued, fetched the URL, wrote title/favicon back
    // to Postgres, and it's visible again through api.
    const enriched = await waitForEnrichment(created.id, cookie);
    assert.ok(enriched.title, 'expected the worker to have set a title');
});