import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { timeAgo } from '../utils/timeAgo';

const SWIPE_THRESHOLD = -80;
const MAX_SWIPE = -110;

export default function CommentCard({ comment, onLike, onRepost, canDelete, onDelete }) {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  function resetPosition() {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
  }

  async function handleConfirmDelete() {
    const result = await onDelete();
    if (result && result.success === false) {
      resetPosition();
      Alert.alert('No se pudo borrar', result.error || 'Probá de nuevo.');
    }
  }

  function confirmDelete() {
    Alert.alert('Borrar comentario', '¿Seguro que querés borrar este comentario?', [
      { text: 'Cancelar', onPress: resetPosition },
      { text: 'Borrar', style: 'destructive', onPress: handleConfirmDelete },
    ]);
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        canDelete && Math.abs(gestureState.dx) > 6 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (evt, gestureState) => {
        translateX.setValue(Math.max(MAX_SWIPE, Math.min(0, gestureState.dx)));
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          confirmDelete();
        } else {
          resetPosition();
        }
      },
      onPanResponderTerminate: resetPosition,
    })
  ).current;

  function handleLike() {
    if (liked) return;
    setLiked(true);
    onLike();
  }

  function handleRepost() {
    if (reposted) return;
    setReposted(true);
    onRepost();
  }

  return (
    <View style={styles.container}>
      {canDelete && (
        <View style={styles.deleteBackground}>
          <Ionicons name="trash" size={16} color="#fff" />
          <Text style={styles.deleteBackgroundText}>Borrar</Text>
        </View>
      )}

      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={[colors.accentPrimary, colors.accentSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarInitial}>{comment.author.name.charAt(0).toUpperCase()}</Text>
        </LinearGradient>

        <View style={styles.bubble}>
          <View style={styles.headerRow}>
            <Text style={styles.author}>{comment.author.name}</Text>
            <View style={styles.dot} />
            <Text style={styles.time}>{timeAgo(comment.createdAt)}</Text>
          </View>

          <Text style={styles.text}>{comment.text}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, liked && styles.actionButtonActive]}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={15}
                color={liked ? colors.accentSecondary : colors.textMuted}
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
              <Ionicons
                name="repeat"
                size={15}
                color={reposted ? colors.accentPrimary : colors.textMuted}
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
  deleteBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.danger,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 22,
  },
  deleteBackgroundText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
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
    fontWeight: 'bold',
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
    fontWeight: '600',
    fontSize: 13,
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
  },
  text: {
    color: colors.text,
    fontSize: 14,
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
    marginLeft: 'auto',
    fontStyle: 'italic',
  },
});
