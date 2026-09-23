import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';
import { formatNumber } from '../utils/formatNumber';

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
          <View style={styles.featuredBadge}>
            <Ionicons name="sparkles" size={12} color={colors.onAccentPrimary} />
            <Text style={styles.featuredBadgeText}>DESTACADA</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={colors.background} />
            <Text style={styles.ratingBadgeText}>{movie.rating}</Text>
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
              {movie.genre} · {movie.year}
            </Text>
            <View style={styles.statsRow}>
              <Ionicons name="eye-outline" size={13} color={colors.textMuted} />
              <Text style={styles.statText}>{formatNumber(movie.views)}</Text>
            </View>
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
    justifyContent: 'space-between',
    padding: 12,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  featuredBadgeText: {
    color: colors.onAccentPrimary,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.rating,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  ratingBadgeText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: 4,
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
