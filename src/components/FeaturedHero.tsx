import { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import AppIcon from './AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '../theme';
import { formatRating, getMovieYear, getPrimaryGenre } from '../utils/movieMetadata';

const ROTATE_INTERVAL = 5000;
const FADE_DURATION = 450;

export default function FeaturedHero({ movies, onPressMovie }) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  function crossfadeTo(nextIndex) {
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setIndex(nextIndex);
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
    });
  }

  useEffect(() => {
    if (movies.length < 2) return undefined;
    const timer = setTimeout(() => {
      crossfadeTo((index + 1) % movies.length);
    }, ROTATE_INTERVAL);
    return () => clearTimeout(timer);
  }, [index, movies.length]);

  const movie = movies[index];
  if (!movie) return null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPressMovie(movie.id)}
    >
      <Animated.View style={[styles.fadeLayer, { opacity }]}>
        <Image source={{ uri: movie.backdropUrl || movie.posterUrl }} style={styles.image} />

        <View style={styles.topRow}>
          <View style={styles.ratingBadge}>
            <AppIcon name="star" size={12} tone="movieRating" />
            <Text style={styles.ratingBadgeText}>{formatRating(movie.communityRating)}</Text>
          </View>
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(10,14,26,0.85)', colors.background]}
          style={styles.gradient}
        >
          <Text style={styles.title} numberOfLines={2}>
            {movie.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {getPrimaryGenre(movie)} · {getMovieYear(movie)}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {movies.length > 1 && (
        <View style={styles.dots}>
          {movies.map((m, i) => (
            <TouchableOpacity
              key={m.id}
              hitSlop={8}
              onPress={() => i !== index && crossfadeTo(i)}
            >
              <View style={[styles.dot, i === index && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  fadeLayer: {
    ...StyleSheet.absoluteFill,
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.movieRating,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  ratingBadgeText: {
    color: colors.movieRating,
    fontSize: 12,
    fontFamily: fonts.label,
    marginLeft: 4,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.title,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: colors.rating,
    width: 16,
  },
});
