import { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import ReviewCard from '../components/ReviewCard';
import AppIcon from '../components/AppIcon';
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

  // Se recarga cada vez que se vuelve a la pantalla
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
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={reviews}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accentPrimary} />
      }
      renderItem={({ item }) => (
        <ReviewCard
          review={item}
          onPress={() => item.movie && navigation.navigate('MovieDetail', { movieId: item.movie.id })}
        />
      )}
      ListEmptyComponent={
        <View style={styles.centered}>
          <AppIcon name={error ? 'cloud-offline-outline' : 'people-outline'} size={40} />
          <Text style={styles.emptyTitle}>{error || 'Todavía no hay reseñas de tus amigos'}</Text>
          {error ? (
            <TouchableOpacity style={styles.primaryButton} onPress={load} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.mutedText}>Cuando tus amigos publiquen, las vas a ver acá.</Text>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, flexGrow: 1 },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: { color: colors.text, fontSize: 16, fontFamily: fonts.title, marginTop: 12, textAlign: 'center' },
  mutedText: { color: colors.textMuted, fontSize: 13, fontFamily: fonts.body, marginTop: 6, textAlign: 'center' },
  primaryButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  primaryButtonText: { color: colors.onAccentPrimary, fontFamily: fonts.label },
});

export default FriendsFeedScreen;
