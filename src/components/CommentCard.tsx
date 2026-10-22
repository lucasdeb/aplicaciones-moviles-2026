import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppIcon from './AppIcon';
import { colors, fonts } from '../theme';
import { timeAgo } from '../utils/timeAgo';
import { Image } from 'react-native';
import StarRating from './StarRating';
import ConfirmModal from './ConfirmModal';

const SWIPE_THRESHOLD = -80;
const MAX_SWIPE = -110;

export default function CommentCard({ comment, onLike, onRepost, canDelete,onPressAuthor, onDelete, initialReposted = false ,initialLiked = false, }) {
  const [liked, setLiked] = useState(initialLiked);
  const [reposted, setReposted] = useState(initialReposted);
  const translateX = useRef(new Animated.Value(0)).current;
  const authorName = comment.author?.name ?? 'Usuario';
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  function resetPosition() {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
  }

  function requestDelete() {
    setDeleteError('');
    setDeleteVisible(true);
  }

  function cancelDelete() {
    if (deleting) return;

    setDeleteVisible(false);
    setDeleteError('');
    resetPosition();
  }

  async function handleConfirmDelete() {
    setDeleting(true);

    const result = await onDelete();

    if (result?.success === false) {
      setDeleting(false);
      setDeleteError(result.error || 'No se pudo borrar la reseña.');
      resetPosition();
    }
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gestureState) =>
        canDelete && Math.abs(gestureState.dx) > 6 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_event, gestureState) => {
        translateX.setValue(Math.max(MAX_SWIPE, Math.min(0, gestureState.dx)));
      },
      onPanResponderRelease: (_event, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          requestDelete();
        } else {
          resetPosition();
        }
      },
      onPanResponderTerminate: resetPosition,
    })
  ).current;

  async function handleLike() {
    const isNowLiked = await onLike();
    if (typeof isNowLiked === 'boolean') setLiked(isNowLiked);
  }

  async function handleRepost() {
    const isNowReposted = await onRepost();
    setReposted(isNowReposted);
  }

  return (
    <View style={styles.container}>

      <ConfirmModal
        visible={deleteVisible}
        title="Borrar reseña"
        message={
          deleteError ||
          '¿Seguro que querés borrar esta reseña? Esta acción no se puede deshacer.'
        }
        confirmLabel={deleteError ? 'Reintentar' : 'Borrar'}
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={cancelDelete}
      />

      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity onPress={onPressAuthor} disabled={!onPressAuthor} activeOpacity={0.7}>
          <LinearGradient
            colors={[colors.accentPrimary, colors.accentSecondary]}
             start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
             style={styles.avatar}
                >
            <Text style={styles.avatarInitial}>{authorName.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bubble}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onPressAuthor} disabled={!onPressAuthor} hitSlop={6}>
              <Text style={styles.author}>{authorName}</Text>
            </TouchableOpacity>
            <View style={styles.dot} />
            <Text style={styles.time}>{timeAgo(comment.createdAt)}</Text>
          </View>
          {comment.rating !== null && comment.rating !== undefined && (
          <View style={styles.stars}>
            <StarRating rating={comment.rating} size={12} />
          </View>
          )}

          <Text style={styles.text}>{comment.text}</Text>
          {comment.photo && <Image source={{ uri: comment.photo }} style={styles.photo} />}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, liked && styles.actionButtonActive]}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <AppIcon
                name={liked ? 'heart' : 'heart-outline'}
                size={15}
              />
              <Text style={[styles.actionCount, liked && styles.actionCountActive]}>
                {comment.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, reposted && styles.actionButtonActive]}
              onPress={handleRepost}
              activeOpacity={0.7}
            >
              <AppIcon
                name="repeat"
                size={15}
              />
              <Text style={[styles.actionCount, reposted && styles.actionCountActivePrimary]}>
                {comment.reposts}
              </Text>
            </TouchableOpacity>

            {canDelete && (
              <Text style={styles.swipeHint}>← deslizá para borrar</Text>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  avatarInitial: {
    color: colors.onAccentPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    color: colors.text,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  photo: { 
    width: '100%', aspectRatio: 4 / 3, 
    borderRadius: 10, 
    marginTop: 8,
    backgroundColor: colors.surfaceAlt 
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
    marginHorizontal: 6,
  },
  time: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
  },
  text: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.body,
    lineHeight: 20,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
  },
  actionButtonActive: {
    backgroundColor: colors.background,
  },
  actionCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    marginLeft: 5,
  },
  actionCountActive: {
    color: colors.accentSecondary,
  },
  actionCountActivePrimary: {
    color: colors.accentPrimary,
  },
  swipeHint: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.body,
    marginLeft: 'auto',
    fontStyle: 'italic',
  },
  stars: {
    marginTop: 4,
  },
});
