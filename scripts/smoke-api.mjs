import assert from 'node:assert/strict';
process.env.NODE_ENV = 'test';
const { createApp } = await import('../backend/src/app.js');

const app = createApp();
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const { port } = server.address();
try {
  const health = await fetch(`http://127.0.0.1:${port}/api/health`);
  const ready = await fetch(`http://127.0.0.1:${port}/api/ready`);
  const healthBody = await health.json();
  const readyBody = await ready.json();
  assert.equal(health.status, 503);
  assert.equal(ready.status, 503);
  assert.equal(healthBody.data.status, 'degraded');
  assert.equal(readyBody.data.ready, false);
  console.log(`GET /api/health -> ${health.status} degraded (MongoDB not configured)`);
  console.log(`GET /api/ready -> ${ready.status} ready=false (MongoDB not configured)`);
  console.log('API smoke checks passed for the dependency-free health/readiness path.');
} finally {
  await new Promise(resolve => server.close(resolve));
}
