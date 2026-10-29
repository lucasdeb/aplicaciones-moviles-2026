import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiUrl } from '../src/services/apiUrl';

test('Local API follows the current Expo network and keeps explicit production URLs', () => {
  assert.equal(resolveApiUrl({ development: true, expoHost: '192.168.0.10:8081' }), 'http://192.168.0.10:3000/api');
  assert.equal(resolveApiUrl({ development: true, expoHost: '172.29.153.61:8081', configuredUrl: ' ' }), 'http://172.29.153.61:3000/api');
  assert.equal(resolveApiUrl({ development: true, expoHost: 'exp://172.29.153.61:8081' }), 'http://172.29.153.61:3000/api');
  assert.equal(resolveApiUrl({ development: true, browserHostname: 'localhost', expoHost: '172.29.153.61:8081' }), 'http://localhost:3000/api');
  assert.equal(resolveApiUrl({ development: true, expoHost: '[::1]:8081' }), 'http://[::1]:3000/api');
  assert.equal(resolveApiUrl({ development: true, expoHost: '172.29.153.61:8081', configuredUrl: 'https://api.example.com/api/' }), 'https://api.example.com/api');
  assert.equal(resolveApiUrl({ development: false, expoHost: '172.29.153.61:8081' }), 'http://localhost:3000/api');
  assert.equal(resolveApiUrl({ development: false, configuredUrl: 'https://api.example.com/api' }), 'https://api.example.com/api');
});
