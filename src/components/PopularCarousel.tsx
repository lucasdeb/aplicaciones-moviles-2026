import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme';
import MovieCard from './MovieCard';

const CARD_WIDTH = 148;
const CARD_SPACING = 14;
const ITEM_SIZE = CARD_WIDTH + CARD_SPACING;
const AUTOPLAY_INTERVAL = 3500;

export default function PopularCarousel({ movies, onPressMovie, showRecentReviewCount = false }) {
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
          useNativeDriver: false,
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
            <Animated.View
              key={item.id}
              style={[styles.card, { opacity, transform: [{ scale }, { translateY }] }]}
            >
              <MovieCard
                movie={item}
                onPress={() => onPressMovie(item.id)}
                reviewCount={
                  showRecentReviewCount ? item.reviewsLast30Days : item.commentsCount
                }
              />
            </Animated.View>
          );
        })}
      </Animated.ScrollView>

      <View style={styles.dots}>
        {movies.map((item, index) => {
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
              key={item.id}
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
