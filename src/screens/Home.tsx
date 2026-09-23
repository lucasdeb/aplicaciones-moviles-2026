import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Animated,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import MovieCard from '../components/MovieCard';
import ReviewCard from '../components/ReviewCard';
import PopularCarousel from '../components/PopularCarousel';
import FeaturedHero from '../components/FeaturedHero';
import RevealOnScroll from '../components/RevealOnScroll';
import { colors } from '../theme';

const MENU_ITEMS = [
  { key: 'achievements', label: 'Logros', icon: 'trophy-outline' as const, screen: 'Achievements' },
];

function HeaderMenu({ navigation }) {
  const [visible, setVisible] = useState(false);

  function goTo(screen) {
    setVisible(false);
    navigation.navigate(screen);
  }

  return (
    <>
      <TouchableOpacity style={styles.menuButton} onPress={() => setVisible(true)} hitSlop={8}>
        <Ionicons name="menu" size={22} color={colors.accentPrimarySoft} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.menuItem}
                onPress={() => goTo(item.screen)}
              >
                <Ionicons name={item.icon} size={18} color={colors.text} />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

function SectionHeader({ title }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionBar} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function HomeScreen({ navigation }) {
  const {
    movies,
    feed,
    user: { user: currentUser },
    fetchMovies,
    fetchFeaturedMovies,
    fetchPopularReviews,
    fetchPopularReviewers,
  } = useApp();
  useEffect(() => {
    fetchMovies();
    fetchFeaturedMovies();
    fetchPopularReviews();
    fetchPopularReviewers();
  }, []);

  function refreshAll() {
    fetchMovies();
    fetchFeaturedMovies();
    fetchPopularReviews();
    fetchPopularReviewers();
  }

  function goToMovie(movieId) {
    navigation.navigate('MovieDetail', { movieId });
  }

  const scrollY = useRef(new Animated.Value(0)).current;
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const isInitialLoading = movies.isFetching && movies.list.length === 0;
  const heroMovies = movies.featured.length > 0 ? movies.featured : movies.list.slice(0, 1);

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.brandWordmark}>
          <View style={styles.logoBadge}>
            <Ionicons name="film" size={14} color={colors.onAccentPrimary} />
          </View>
          <Text style={styles.brand}>
            What's<Text style={styles.brandAccent}>Next</Text>
          </Text>
        </View>

        <View style={styles.brandIcons}>
          <TouchableOpacity style={styles.iconButton} hitSlop={8}>
            <Ionicons name="search-outline" size={18} color={colors.accentPrimarySoft} />
          </TouchableOpacity>
          <HeaderMenu navigation={navigation} />
        </View>
      </View>

      {currentUser?.name ? (
        <View style={styles.greetingPillWrap}>
          <TouchableOpacity style={styles.greetingPill}>
            <Ionicons name="person-circle-outline" size={16} color={colors.accentPrimarySoft} />
            <Text style={styles.greetingText} numberOfLines={1}>
              Hola, {currentUser.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isInitialLoading ? (
        <ActivityIndicator color={colors.accentPrimary} style={styles.loader} />
      ) : movies.error ? (
        <Text style={styles.error}>{movies.error}</Text>
      ) : (
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={movies.isFetching}
              onRefresh={refreshAll}
              tintColor={colors.accentPrimary}
            />
          }
        >
          {heroMovies.length > 0 ? (
            <View style={styles.heroWrap}>
              <FeaturedHero movies={heroMovies} onPressMovie={goToMovie} />
            </View>
          ) : null}

          <SectionHeader title="En tendencia ahora" />
          <PopularCarousel movies={heroMovies} onPressMovie={goToMovie} />

          {feed.popularReviews.length > 0 && (
            <RevealOnScroll scrollY={scrollY}>
              <SectionHeader title="Reseñas populares" />
              <View style={styles.reviewsList}>
                {feed.popularReviews.slice(0, 5).map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onPress={() => goToMovie(review.movie.id)}
                  />
                ))}
              </View>
            </RevealOnScroll>
          )}

          {movies.featured.length > 0 && (
            <RevealOnScroll scrollY={scrollY}>
              <SectionHeader title="Elegidas por el equipo" />
              <FlatList
                data={movies.featured}
                keyExtractor={(item) => String(item.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.pickCard}
                    activeOpacity={0.8}
                    onPress={() => goToMovie(item.id)}
                  >
                    <LinearGradient
                      colors={[colors.accentPrimary, colors.accentSecondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.pickBorder}
                    >
                      <Image source={{ uri: item.posterUrl }} style={styles.pickPoster} />
                    </LinearGradient>
                    <Text style={styles.pickTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </RevealOnScroll>
          )}

          {feed.popularReviewers.length > 0 && (
            <RevealOnScroll scrollY={scrollY}>
              <SectionHeader title="Reseñadores populares" />
              <FlatList
                data={feed.popularReviewers}
                keyExtractor={(item) => String(item.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselList}
                renderItem={({ item }) => (
                  <View style={styles.reviewerCard}>
                    <LinearGradient
                      colors={[colors.accentPrimary, colors.accentSecondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.reviewerAvatar}
                    >
                      <Text style={styles.reviewerInitial}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>
                    <Text style={styles.reviewerName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.reviewerCount}>{item.reviewCount} reseñas</Text>
                  </View>
                )}
              />
            </RevealOnScroll>
          )}

          <RevealOnScroll scrollY={scrollY}>
            <SectionHeader title="Explorar todas" />
            <FlatList
              data={movies.list}
              keyExtractor={(item) => String(item.id)}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridList}
              renderItem={({ item }) => (
                <MovieCard movie={item} onPress={() => goToMovie(item.id)} />
              )}
            />
          </RevealOnScroll>
        </Animated.ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 56,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  brandWordmark: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  brandAccent: {
    color: colors.accentPrimarySoft,
    fontStyle: 'italic',
  },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingPillWrap: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  greetingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  greetingText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  heroWrap: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  menuButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuCard: {
    position: 'absolute',
    top: 96,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    color: colors.text,
    fontSize: 14,
    marginLeft: 10,
  },
  loader: {
    marginTop: 40,
  },
  error: {
    color: colors.danger,
    marginTop: 24,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.accentSecondary,
    marginRight: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  carouselList: {
    paddingHorizontal: 16,
  },
  reviewsList: {
    paddingHorizontal: 16,
  },
  pickCard: {
    width: 100,
    marginRight: 14,
    alignItems: 'center',
  },
  pickBorder: {
    padding: 2,
    borderRadius: 12,
  },
  pickPoster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
  },
  pickTitle: {
    color: colors.text,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  reviewerCard: {
    width: 90,
    marginRight: 14,
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerInitial: {
    color: colors.onAccentPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  reviewerName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  reviewerCount: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  gridList: {
    paddingBottom: 24,
  },
});

export default HomeScreen;
