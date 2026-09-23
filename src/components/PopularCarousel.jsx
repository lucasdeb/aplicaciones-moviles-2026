import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { formatNumber } from '../utils/formatNumber';

const CARD_WIDTH = 148;
const CARD_SPACING = 14;
const ITEM_SIZE = CARD_WIDTH + CARD_SPACING;
const AUTOPLAY_INTERVAL = 3500;

export default function PopularCarousel({ movies, onPressMovie }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const indexRef = useRef(0);
  const isInteractingRef = useRef(false);

  useEffect(() => {
    if (movies.length < 2) return undefined;

    const timer = setInterval(() => {
      if (isInteractingRef.current) return;
      const nextIndex = (indexRef.current + 1) % movies.length;
      scrollRef.current?.scrollTo({ x: nextIndex * ITEM_SIZE, animated: true });
      indexRef.current = nextIndex;
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [movies.length]);

  function handleMomentumEnd(event) {
    indexRef.current = Math.round(event.nativeEvent.contentOffset.x / ITEM_SIZE);
  }

  return (
    <View>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_SIZE}
        decelerationRate="fast"
        contentContainerStyle={styles.list}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          isInteractingRef.current = true;
        }}
        onScrollEndDrag={() => {
          setTimeout(() => {
            isInteractingRef.current = false;
          }, AUTOPLAY_INTERVAL);
        }}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        {movies.map((item, index) => {
          const inputRange = [
            (index - 1) * ITEM_SIZE,
            index * ITEM_SIZE,
            (index + 1) * ITEM_SIZE,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.88, 1, 0.88],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.55, 1, 0.55],
            extrapolate: 'clamp',
          });
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [8, 0, 8],
            extrapolate: 'clamp',
          });

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => onPressMovie(item.id)}
            >
              <Animated.View
                style={[styles.card, { opacity, transform: [{ scale }, { translateY }] }]}
              >
                <View>
                  <Image source={{ uri: item.posterUrl }} style={styles.poster} />
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color={colors.background} />
                    <Text style={styles.ratingBadgeText}>{item.rating}</Text>
                  </View>
                </View>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.genre} · {item.year}
                </Text>
                <View style={styles.statsRow}>
                  <Ionicons name="eye-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.statText}>{formatNumber(item.views)}</Text>
                  <Ionicons
                    name="chatbubble-outline"
                    size={12}
                    color={colors.textMuted}
                    style={styles.statSpacing}
                  />
                  <Text style={styles.statText}>{item.commentsCount}</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>

      <View style={styles.dots}>
        {movies.map((_, index) => {
          const inputRange = [
            (index - 1) * ITEM_SIZE,
            index * ITEM_SIZE,
            (index + 1) * ITEM_SIZE,
          ];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [6, 18, 6],
            extrapolate: 'clamp',
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={index}
              style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
  },
  ratingBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.rating,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  ratingBadgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statText: {
    color: colors.textMuted,
    fontSize: 11,
    marginLeft: 3,
  },
  statSpacing: {
    marginLeft: 8,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentSecondary,
    marginHorizontal: 3,
  },
});
