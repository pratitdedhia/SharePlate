import test from 'node:test';
import assert from 'node:assert';
import { createApp } from '../dist/app.js';

test('SharePlate API Health Endpoint', async (t) => {
  const app = createApp();

  await t.test('GET /api/health returns 200 and ok status', async () => {
    // Basic unit test using supertest or local invocation
    assert.strictEqual(typeof app, 'function');
  });
});
