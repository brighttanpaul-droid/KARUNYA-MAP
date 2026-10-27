/**
 * Backend API & Security Authentication Unit Tests
 */

process.env.NODE_ENV = 'test';
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../server/server');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

async function apiRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  return { status: response.status, data };
}

describe('Server API & Security Tests', () => {
  it('GET /api/health should return system status', async () => {
    const res = await apiRequest('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.data.status, 'ONLINE');
  });

  it('GET /api/campus/buildings should return verified Karunya buildings', async () => {
    const res = await apiRequest('/api/campus/buildings');
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.length >= 20);

    const admin = res.data.data.find((b) => b.id === 'ADMIN');
    assert.ok(admin);
    assert.equal(admin.name.includes('Administrative'), true);
  });

  it('GET /api/campus/paths should return verified walkable connections', async () => {
    const res = await apiRequest('/api/campus/paths');
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.length >= 30);
  });

  it('POST /api/admin/buildings WITHOUT token should be rejected (401)', async () => {
    const res = await apiRequest('/api/admin/buildings', {
      method: 'POST',
      body: JSON.stringify({ id: 'HACKED', name: 'Unauthorized' }),
    });
    assert.equal(res.status, 401);
    assert.equal(res.data.success, false);
  });

  it('POST /api/admin/login with incorrect credentials should fail (401)', async () => {
    const res = await apiRequest('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword' }),
    });
    assert.equal(res.status, 401);
    assert.equal(res.data.success, false);
  });

  it('POST /api/admin/login with valid credentials should return signed JWT token', async () => {
    const res = await apiRequest('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'karunya123' }),
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.token);
    assert.equal(res.data.user.role, 'ADMIN');

    // Test protected route with this token
    const token = res.data.token;
    const testBuildingId = 'TEST_LAB_' + Date.now();
    const createRes = await apiRequest('/api/admin/buildings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        id: testBuildingId,
        name: 'Temporary Test Lab',
        category: 'academic',
        lat: 10.936,
        lng: 76.744,
        description: 'Testing Admin permissions',
      }),
    });
    assert.equal(createRes.status, 201);
    assert.equal(createRes.data.success, true);

    // Clean up test building
    const deleteRes = await apiRequest(`/api/admin/buildings/${testBuildingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(deleteRes.status, 200);
    assert.equal(deleteRes.data.success, true);
  });
});
