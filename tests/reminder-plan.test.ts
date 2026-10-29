import test from 'node:test';
import assert from 'node:assert/strict';
import { foreignReleaseReminders } from '../src/utils/releaseReminderPlan';
test('Push migration removes legacy and account-specific local release alerts without touching unrelated notifications', () => {
  const current = { id: 'current', data: { kind: 'release-reminder', userId: 7, movieId: 1 } };
  const legacy = { id: 'legacy', data: { movieId: 2 } };
  const unrelated = { id: 'other', data: { kind: 'another-feature' } };
  assert.deepEqual(foreignReleaseReminders([current, legacy, unrelated], 7), ['legacy']);
  assert.deepEqual(foreignReleaseReminders([current, legacy, unrelated], 8), ['current', 'legacy']);
  assert.deepEqual(foreignReleaseReminders([current, legacy, unrelated]), ['current', 'legacy']);
});
