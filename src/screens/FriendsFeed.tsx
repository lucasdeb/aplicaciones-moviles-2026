import { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import AppIcon from '../components/AppIcon';
import ReviewCard from '../components/ReviewCard';
import RepostHeader from '../components/RepostHeader';
import { getFriendReviews } from '../services/api';
import { useOnFocus } from '../hooks/useOnFocus';
import { colors, fonts } from '../theme';

function FriendsFeedScreen({ navigation }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      setReviews(await getFriendReviews());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useOnFocus(load, []);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentPrimary} />
        <Text style={styles.mutedText}>Cargando reseñas...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={reviews}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accentPrimary} />
      }
      renderItem={({ item }) => (
        <View>
          {item.repostedBy && (
            <RepostHeader
              name={item.repostedBy.name}
              onPress={() => navigation.push('UserProfile', { userId: item.repostedBy.id })}
            />
          )}
          <ReviewCard
            review={item}
            onPress={() => item.movie && navigation.navigate('MovieDetail', { movieId: item.movie.id })}
          />
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.centered}>
          <AppIcon name={error ? 'cloud-offline-outline' : 'people-outline'} size={40} />
          <Text style={styles.mutedText}>
            {error ? `No pudimos cargar las reseñas. ${error}` : 'Todavía no hay reseñas de tus amigos. Cuando publiquen, las vas a ver acá.'}
          </Text>
          {error ? (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                load();
              }}
            >
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, backgroundColor: colors.background },
  mutedText: { color: colors.textMuted, fontSize: 13, fontFamily: fonts.body, marginTop: 12, textAlign: 'center' },
  retryButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  retryText: { color: colors.onAccentPrimary, fontFamily: fonts.bodyBold },
  list: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
});

export default FriendsFeedScreen;
