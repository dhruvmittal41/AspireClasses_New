import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServerClient } from '@supabase/ssr';
import { authCookieOptions } from '../src/lib/supabase/cookie-options.ts';

test('session survives a new client, refresh rotation, and clears on sign-out', async () => {
  const jar = new Map();
  const user = { id: '00000000-0000-4000-8000-000000000001', email: 'fixture@example.com', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
  let rotation = 0;
  const token = () => [
    { alg: 'HS256', typ: 'JWT' },
    { sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600, aud: 'authenticated', role: 'authenticated', rotation },
  ].map(value => Buffer.from(JSON.stringify(value)).toString('base64url')).join('.') + '.fixture';
  const mockFetch = async (input) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    if (url.pathname.endsWith('/token')) {
      if (url.searchParams.get('grant_type') === 'refresh_token') rotation++;
      return Response.json({ access_token: token(), refresh_token: 'fixture-refresh-' + rotation, expires_in: 3600, token_type: 'bearer', user });
    }
    if (url.pathname.endsWith('/user')) return Response.json(user);
    if (url.pathname.endsWith('/logout')) return new Response(null, { status: 204 });
    throw new Error('Unexpected mock request: ' + url.pathname);
  };
  const client = () => createServerClient('https://fixture.supabase.co', 'fixture-key', {
    cookieOptions: authCookieOptions,
    global: { fetch: mockFetch },
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: items => items.forEach(({ name, value, options }) => {
        assert.equal(options.path, '/');
        assert.equal(options.sameSite, 'lax');
        if (options.maxAge === 0) jar.delete(name);
        else { assert.ok(options.maxAge > 86400); jar.set(name, value); }
      }),
    },
  });
  const initial = client();
  await initial.auth.getSession();
  const { error } = await initial.auth.signInWithPassword({ email: user.email, password: 'fixture-password' });
  assert.equal(error, null);
  assert.ok(jar.size > 0);
  const reloaded = client();
  assert.equal((await reloaded.auth.getUser()).data.user.id, user.id);
  assert.equal((await reloaded.auth.refreshSession()).error, null);
  assert.equal(rotation, 1);
  const afterRefresh = client();
  assert.equal((await afterRefresh.auth.getUser()).data.user.id, user.id);
  assert.equal((await afterRefresh.auth.signOut()).error, null);
  assert.equal(jar.size, 0);
  assert.equal((await client().auth.getUser()).data.user, null);
});
