import test from 'node:test';
import assert from 'node:assert/strict';
import { pushDestination } from '../src/utils/pushDestination';
test('Backend push payloads open the relevant profile or movie, including cold-start destinations', () => {
  assert.deepEqual(pushDestination({ kind: 'friend-request', userId: 8 }), { screen: 'UserProfile', params: { userId: 8 } });
  for (const kind of ['release-reminder', 'review-like', 'review-repost']) {
    assert.deepEqual(pushDestination({ kind, movieId: 9 }), { screen: 'MovieDetail', params: { movieId: 9 } });
  }
  for (const data of [undefined, {}, { kind: 'friend-request', userId: '8' }, { kind: 'review-like', movieId: -1 }, { kind: 'other', movieId: 9 }]) {
    assert.equal(pushDestination(data), null);
  }
});
