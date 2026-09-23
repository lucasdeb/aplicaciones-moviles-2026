import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { timeAgo } from '../utils/timeAgo';
import { formatNumber } from '../utils/formatNumber';
import StarRating from './StarRating';

export default function ReviewCard({ review, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: review.movie.posterUrl }} style={styles.poster} />

      <View style={styles.body}>
        <Text style={styles.movieTitle} numberOfLines={1}>
          {review.movie.title} <Text style={styles.movieYear}>{review.movie.year}</Text>
        </Text>

        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {review.author.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.authorName}>{review.author.name}</Text>
          {review.rating ? <StarRating rating={review.rating} size={11} /> : null}
        </View>

        <Text style={styles.text} numberOfLines={3}>
          {review.text}
        </Text>

        <View style={styles.footerRow}>
          <Ionicons name="heart-outline" size={13} color={colors.textMuted} />
          <Text style={styles.likes}>{formatNumber(review.likes)} likes</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.time}>{timeAgo(review.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  poster: {
    width: 56,
    height: 84,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  movieTitle: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  movieYear: {
    color: colors.textMuted,
    fontWeight: 'normal',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  avatarInitial: {
    color: colors.onAccentPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  authorName: {
    color: colors.textMuted,
    fontSize: 12,
    marginRight: 8,
  },
  text: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  likes: {
    color: colors.textMuted,
    fontSize: 11,
    marginLeft: 4,
  },
  dot: {
    color: colors.textMuted,
    fontSize: 11,
    marginHorizontal: 6,
  },
  time: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
