import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const RELEASE_CHANNEL_ID = 'estrenos';
const RELEASE_REMINDER_KIND = 'release-reminder';

function isReleaseReminder(notification: Notifications.NotificationRequest) {
  return notification.content.data?.kind === RELEASE_REMINDER_KIND;
}

function movieIdFrom(notification: Notifications.NotificationRequest) {
  const movieId = Number(notification.content.data?.movieId);
  return Number.isInteger(movieId) ? movieId : null;
}

async function scheduledReleaseReminders() {
  if (Platform.OS === 'web') return [];
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications.filter(isReleaseReminder);
}

async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function configureLocalNotifications() {
  if (Platform.OS === 'web') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(RELEASE_CHANNEL_ID, {
      name: 'Estrenos',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function getLocalReleaseReminderMovieIds() {
  const notifications = await scheduledReleaseReminders();
  return notifications.map(movieIdFrom).filter((movieId): movieId is number => movieId !== null);
}

export async function toggleLocalReleaseReminder(movie: {
  id: number;
  title: string;
  releaseDate: string;
}) {
  if (Platform.OS === 'web') throw new Error('Los avisos están disponibles en iOS y Android.');

  const existing = (await scheduledReleaseReminders()).filter(
    notification => movieIdFrom(notification) === movie.id,
  );

  if (existing.length) {
    await Promise.all(
      existing.map(notification =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
      ),
    );
    return false;
  }

  if (!(await requestNotificationPermission())) {
    throw new Error('Activá las notificaciones de WhatNext desde la configuración del teléfono.');
  }

  const reminderDate = new Date(`${movie.releaseDate}T10:00:00-03:00`);
  if (Number.isNaN(reminderDate.getTime())) throw new Error('La película no tiene una fecha de estreno válida.');
  if (reminderDate <= new Date()) throw new Error('La fecha del aviso ya pasó.');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Hoy se estrena!',
      body: movie.title,
      sound: 'default',
      data: { kind: RELEASE_REMINDER_KIND, movieId: movie.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      channelId: RELEASE_CHANNEL_ID,
    },
  });

  return true;
}
