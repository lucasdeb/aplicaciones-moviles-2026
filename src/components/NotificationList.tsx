import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppIcon from './AppIcon';
import { colors, fonts } from '../theme';
import { timeAgo } from '../utils/timeAgo';

export type AppNotification = {
  id: number;
  type: 'friend_request' | 'review_like' | 'review_repost';
  read: boolean;
  createdAt: string;
  actor: { id: number; name: string };
  commentId: number | null;
  movie: { id: number; title: string } | null;
};

type NotificationListProps = {
  notifications: AppNotification[];
  onPress: (notification: AppNotification) => void;
  onMarkAllRead: () => void;
  onClose?: () => void;
};

const CONTENT = {
  friend_request: {
    icon: 'person-add',
    text: 'te envió una solicitud de amistad',
  },
  review_like: {
    icon: 'heart',
    text: 'le dio like a tu reseña',
  },
  review_repost: {
    icon: 'repeat',
    text: 'reposteó tu reseña',
  },
} as const;

export default function NotificationList({
  notifications,
  onPress,
  onMarkAllRead,
  onClose,
}: NotificationListProps) {
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>
          Notificaciones{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={onMarkAllRead} hitSlop={8}>
              <Text style={styles.markAll}>Marcar todas como leídas</Text>
            </TouchableOpacity>
          )}
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={8}>
              <AppIcon name="close" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {notifications.length === 0 ? (
        <Text style={styles.empty}>Todavía no tenés notificaciones.</Text>
      ) : (
        notifications.map((notification) => {
          const content = CONTENT[notification.type];
          return (
            <TouchableOpacity
              key={notification.id}
              style={[styles.row, !notification.read && styles.rowUnread]}
              onPress={() => onPress(notification)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrap}>
                <AppIcon name={content.icon} size={18} />
              </View>
              <View style={styles.body}>
                <Text style={styles.message}>
                  <Text style={styles.actor}>{notification.actor.name}</Text>{' '}
                  {content.text}
                  {notification.movie ? ` de ${notification.movie.title}` : ''}.
                </Text>
                <Text style={styles.time}>{timeAgo(notification.createdAt)}</Text>
              </View>
              {!notification.read && <View style={styles.unreadDot} />}
              <AppIcon name="chevron-forward" size={16} />
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.title,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  markAll: {
    color: colors.accentPrimary,
    fontSize: 11,
    fontFamily: fonts.label,
  },
  closeButton: {
    marginLeft: 12,
    padding: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  rowUnread: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.surfaceHigh,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229,9,20,0.15)',
    marginRight: 10,
  },
  body: {
    flex: 1,
  },
  message: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.body,
  },
  actor: {
    fontFamily: fonts.bodyBold,
  },
  time: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
    marginTop: 3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentPrimary,
    marginHorizontal: 8,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.body,
  },
});
