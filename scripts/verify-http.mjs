import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

// Run after pnpm build. Uses the compiled public configuration; no accounts are created.
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '4187'], { stdio: ['ignore', 'pipe', 'pipe'] });
let ready = false;
let output = '';
child.stderr.on('data', bytes => process.stderr.write(bytes));
const timeout = setTimeout(() => {
  console.error('Production server did not become ready'); process.exitCode = 1; child.kill('SIGTERM');
}, 20000);
child.on('error', error => { console.error(error.message); process.exitCode = 1; clearTimeout(timeout); });
child.on('exit', () => { clearTimeout(timeout); if (!ready) process.exitCode = 1; });
child.stdout.on('data', async bytes => {
  output += bytes.toString();
  if (ready || !output.includes('Ready')) return;
  ready = true; clearTimeout(timeout);
  try {
    for (const [path, status] of [
      ['/api/health', 200], ['/auth', 200], ['/auth-mentor', 200], ['/web', 200],
      ['/home', 307], ['/dashboard', 307], ['/api/jobs', 401],
      ['/api/razorpay/create-order', 401], ['/auth/confirm?next=https://example.invalid', 307],
    ]) {
      const response = await fetch(`http://127.0.0.1:4187${path}`, {
        redirect: 'manual', method: path.includes('create-order') ? 'POST' : 'GET', signal: AbortSignal.timeout(10000),
      });
      assert.equal(response.status, status, path);
      const location = response.headers.get('location');
      if (path === '/home') assert.ok(location?.endsWith('/auth'));
      if (path === '/dashboard') assert.ok(location?.endsWith('/auth-mentor'));
      if (path.includes('confirm')) assert.ok(location?.endsWith('/auth?error=confirmation_failed'));
      if (path.startsWith('/api/')) assert.match(response.headers.get('cache-control') || '', /no-store/);
      console.log(`PASS ${path}: ${status}`);
    }
    console.log('9 production HTTP checks passed. Signed-in flows require deployment validation.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { child.kill('SIGTERM'); }
});
