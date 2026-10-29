import test from 'node:test';
import assert from 'node:assert/strict';
import { notificationTestError, notificationsUnavailable, notificationRegistrationFailed } from '../src/utils/notificationFeedback';

test('Notification failures never expose build instructions or provider diagnostics to users', () => {
  const diagnostics = [
    new Error('Expo Go cannot register remote push; install a development build'),
    { status: 409, message: 'Missing EAS projectId or FCM credentials' },
    { status: 502, message: 'Expo token invalid: INTERNAL_PROVIDER_ERROR' },
    { message: 'DeviceNotRegistered' },
    null,
  ];
  for (const error of diagnostics) {
    const message = notificationTestError(error);
    assert.ok(message.length > 0);
    assert.doesNotMatch(message, /Expo|EAS|FCM|projectId|credentials|development|DeviceNotRegistered|INTERNAL_PROVIDER_ERROR/i);
  }
  assert.doesNotMatch(notificationsUnavailable + notificationRegistrationFailed, /Expo|EAS|FCM|desarrollo|compilación/i);
});

test('Permission-independent test errors retain useful login, connection and rate-limit guidance', () => {
  assert.match(notificationTestError({ status: 401 }), /sesión/);
  assert.match(notificationTestError({ status: 429 }), /minuto/);
  assert.match(notificationTestError({ status: 0 }), /conexión/);
});
