import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme';
import { formatNumber } from '../utils/formatNumber';
import { timeAgo } from '../utils/timeAgo';
import StarRating from '../components/StarRating';

type Mode = 'reviews' | 'likes';

type Review = {
  id: number;
  text: string;
  rating: number | null;
  likes: number;
  createdAt: string;
  movie?: { id: number; title: string; year: number; posterUrl: string };
};

const MODES: { key: Mode; label: string }[] = [
  { key: 'reviews', label: 'Reseñas' },
  { key: 'likes', label: 'Likes' },
];

function UserReviewsScreen({ navigation, route }) {
  const { user, getUserReviews } = useApp();
  const mode: Mode = route.params?.mode ?? 'reviews';
  const [list, setList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user.user) return;
    getUserReviews(user.user.id)
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user.user?.id]);

  // En modo likes se ordena por likes; en reseñas, de la más nueva a la más vieja
  const data = mode === 'likes' ? [...list].sort((a, b) => b.likes - a.likes) : list;
  const totalLikes = list.reduce((sum, r) => sum + r.likes, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'likes' ? 'Likes recibidos' : 'Mis reseñas'}</Text>
      <Text style={styles.subtitle}>
        {mode === 'likes'
          ? `${formatNumber(totalLikes)} likes en ${list.length} reseñas`
          : `${list.length} reseñas publicadas`}
      </Text>

      <View style={styles.segment}>
        {MODES.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.segmentItem, mode === item.key && styles.segmentItemActive]}
            onPress={() => navigation.setParams({ mode: item.key })}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, mode === item.key && styles.segmentTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accentPrimary} style={styles.loader} />
      ) : error ? (
        <Text style={styles.empty}>{error}</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Todavía no publicaste reseñas.</Text>}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => item.movie && navigation.navigate('MovieDetail', { movieId: item.movie.id })}
            >
              {mode === 'likes' && <Text style={styles.rank}>#{index + 1}</Text>}
              <Image source={{ uri: item.movie?.posterUrl }} style={styles.poster} />
              <View style={styles.body}>
                <Text style={styles.movieTitle} numberOfLines={1}>
                  {item.movie?.title} <Text style={styles.movieYear}>{item.movie?.year}</Text>
                </Text>
                {item.rating ? <StarRating rating={item.rating} size={12} /> : null}
                <Text style={styles.text} numberOfLines={3}>{item.text}</Text>
                <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
              </View>
              <View style={[styles.likes, mode === 'likes' && styles.likesHighlight]}>
                <Ionicons name="heart" size={16} color={mode === 'likes' ? colors.rating : colors.textMuted} />
                <Text style={[styles.likesValue, mode === 'likes' && styles.likesValueHighlight]}>
                  {formatNumber(item.likes)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 16,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.title,
    paddingHorizontal: 16,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
    paddingHorizontal: 16,
    marginTop: 2,
  },
  segment: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 4,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: colors.accentPrimary,
  },
  segmentText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.label,
  },
  segmentTextActive: {
    color: colors.onAccentPrimary,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rank: {
    color: colors.rating,
    fontSize: 13,
    fontFamily: fonts.title,
    width: 26,
  },
  poster: {
    width: 52,
    height: 78,
    borderRadius: 8,
    backgroundColor: colors.surfaceHigh,
  },
  body: {
    flex: 1,
    marginLeft: 12,
  },
  movieTitle: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.title,
    marginBottom: 2,
  },
  movieYear: {
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  text: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.body,
    lineHeight: 18,
    marginTop: 4,
  },
  time: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
    marginTop: 4,
  },
  likes: {
    alignItems: 'center',
    marginLeft: 8,
    minWidth: 44,
  },
  likesHighlight: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,193,7,0.12)',
  },
  likesValue: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
    marginTop: 2,
  },
  likesValueHighlight: {
    color: colors.rating,
    fontSize: 15,
    fontFamily: fonts.title,
  },
});

export default UserReviewsScreen;
