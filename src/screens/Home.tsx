import { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Animated,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from 'react-native';
import AppIcon from '../components/AppIcon';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../context/MovieContext';
import { mockGetFriendReviews, mockGetPopularReviews } from '../mockData';
import MovieCard from '../components/MovieCard';
import ReviewCard from '../components/ReviewCard';
import PopularCarousel from '../components/PopularCarousel';
import FeaturedHero from '../components/FeaturedHero';
import RevealOnScroll from '../components/RevealOnScroll';
import BrandLogo from '../components/BrandLogo';
import { colors, fonts } from '../theme';
import SettingsButton from '../components/SettingsButton';
import { useOnFocus } from '../hooks/useOnFocus';

function SectionHeader({ title }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionBar} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function HomeScreen({ navigation }) {
  const { user: { user: currentUser } } = useAuth();
  const { movies, fetchMovies } = useMovies();
  // El feed solo lo usa Home: estado local, no global
  const [popularReviews, setPopularReviews] = useState([]);
  const [friendReviews, setFriendReviews] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');

  // Búsqueda: deja solo las películas cuyo título contiene lo escrito
  const results = movies.list.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  function toggleSearch() {
    setShowSearch(!showSearch);
    setSearch('');
  }

  async function refreshAll() {
    fetchMovies();
    try {
      const [popular, friends] = await Promise.all([
        mockGetPopularReviews(),
        currentUser ? mockGetFriendReviews(currentUser.id) : Promise.resolve([]),
      ]);
      setPopularReviews(popular);
      setFriendReviews(friends);
    } catch (error) {
      console.warn('No se pudo cargar el feed', error);
    }
  }

  useOnFocus(refreshAll, [currentUser?.id]);


  function goToMovie(movieId) {
    navigation.navigate('MovieDetail', { movieId });
  }

  const scrollY = useRef(new Animated.Value(0)).current;
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const isInitialLoading = movies.isFetching && movies.list.length === 0;
  const moviesByRating = movies.list
    .filter((movie) => Number.isFinite(movie.communityRating))
    .sort((a, b) => b.communityRating - a.communityRating);
  const heroMovies = movies.featured.length > 0
    ? movies.featured
    : moviesByRating.slice(0, 4);
  const trendingMovies = [...movies.list]
    .filter((movie) => movie.reviewsLast30Days > 0)
    .sort(
      (a, b) =>
        b.reviewsLast30Days - a.reviewsLast30Days ||
        (b.communityRating ?? 0) - (a.communityRating ?? 0)
    );

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.brandWordmark}>
          <BrandLogo size={44} />
          <Text style={styles.brand}>
            What<Text style={styles.brandAccent}>Next</Text>
          </Text>
        </View>

        <View style={styles.brandIcons}>
          <TouchableOpacity style={styles.iconButton} hitSlop={8} onPress={toggleSearch}>
            <AppIcon name={showSearch ? 'close' : 'search-outline'} size={18} />
          </TouchableOpacity>
            <SettingsButton />
        </View>
      </View>

      {currentUser?.name ? (
        <View style={styles.greetingPillWrap}>
          <view style={styles.greetingPill}>
            <Text style={styles.greetingText} numberOfLines={1}>
              Hola, {currentUser.name.split(' ')[0]}
            </Text>
          </view>
        </View>
      ) : null}

      {showSearch && (
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar película por título"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
      )}

      {search !== '' ? (
        <View>
          <PopularCarousel movies={results} onPressMovie={goToMovie} />
          {results.length === 0 && <Text style={styles.noResults}>No hay películas con ese título.</Text>}
        </View>
      ) : isInitialLoading ? (
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

          {trendingMovies.length > 0 ? (
            <>
              <SectionHeader title="En tendencia ahora" />
              <PopularCarousel
                movies={trendingMovies}
                onPressMovie={goToMovie}
                showRecentReviewCount
              />
            </>
          ) : null}

          {popularReviews.length > 0 && (
            <RevealOnScroll scrollY={scrollY}>
              <SectionHeader title="Reseñas populares" />
              <View style={styles.reviewsList}>
                {popularReviews.slice(0, 5).map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onPress={() => review.movie && goToMovie(review.movie.id)}
                  />
                ))}
              </View>
            </RevealOnScroll>
          )}

          {currentUser && (
            <RevealOnScroll scrollY={scrollY}>
              <SectionHeader title="Reseñas de amigos" />
              {friendReviews.length > 0 ? (
                <View style={styles.reviewsList}>
                  {friendReviews.slice(0, 5).map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onPress={() => review.movie && goToMovie(review.movie.id)}
                    />
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyReviews}>
                  Todavía no hay reseñas de tus amigos.
                </Text>
              )}
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
                <MovieCard
                  movie={item}
                  onPress={() => goToMovie(item.id)}
                  style={styles.gridCard}
                />
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
    fontFamily: fonts.title,
    marginLeft: 8,
  },
  brandAccent: {
    color: colors.accentPrimarySoft,
    fontStyle: 'italic',
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
    fontFamily: fonts.bodySemiBold,
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
    fontFamily: fonts.bodyBold,
  },
  reviewsList: {
    paddingHorizontal: 16,
  },
  emptyReviews: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  gridList: {
    paddingBottom: 24,
  },
  gridCard: {
    width: '31%',
    marginBottom: 16,
  },
  searchInput: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  noResults: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: 24,
  },
});

export default HomeScreen;
