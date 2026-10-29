import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

function fixture() {
  let stored: string | null = null;
  let clear: (() => Promise<void>) | undefined;
  const storage = {
    getItemAsync: async () => stored,
    setItemAsync: async (_key: string, value: string) => { stored = value; },
    deleteItemAsync: async () => { await clear?.(); stored = null; },
  };
  const source = readFileSync(path.join(process.cwd(), 'src/services/session.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const api: any = {};
  new Function('require', 'exports', compiled.outputText)((name: string) => {
    if (name === 'react-native') return { Platform: { OS: 'ios' } };
    if (name === 'expo-secure-store') return storage;
    throw new Error('Unexpected dependency ' + name);
  }, api);
  return { api, stored: () => stored, pauseClear: (wait: () => Promise<void>) => { clear = wait; } };
}

test('An old request cannot expire a newer authenticated session', async () => {
  const { api, stored } = fixture();
  let events = 0;
  api.onSessionExpired(() => events++);
  await api.saveToken('old-session');
  await api.saveToken('new-session');
  await api.expireSession('old-session');
  assert.equal(api.getToken(), 'new-session');
  assert.equal(stored(), 'new-session');
  assert.equal(events, 0);
  await api.expireSession('new-session');
  assert.equal(api.getToken(), null);
  assert.equal(stored(), null);
  assert.equal(events, 1);
});

test('A login during asynchronous session clearing survives in memory and persistent storage', async () => {
  const { api, stored, pauseClear } = fixture();
  let release!: () => void;
  const barrier = new Promise<void>(resolve => { release = resolve; });
  pauseClear(() => barrier);
  let events = 0;
  api.onSessionExpired(() => events++);
  await api.saveToken('old-session');
  const expiration = api.expireSession('old-session');
  const login = api.saveToken('new-session');
  assert.equal(api.getToken(), 'new-session');
  release();
  await Promise.all([expiration, login]);
  assert.equal(stored(), 'new-session');
  assert.equal(events, 0);
});
