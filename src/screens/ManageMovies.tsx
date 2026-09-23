import React, { useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

function ManageMoviesScreen({ navigation }) {
  const { movies, user, fetchMovies, deleteMovie } = useApp();
  useEffect(() => {
    fetchMovies();
  }, []);

  function confirmDelete(movie) {
    Alert.alert('Borrar película', `¿Seguro que querés borrar "${movie.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => deleteMovie(user.user.id, movie.id),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administrar películas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMovie')}
        >
          <Ionicons name="add" size={20} color={colors.onAccentPrimary} />
        </TouchableOpacity>
      </View>

      {movies.isFetching ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accentPrimary} />
          <Text style={styles.loadingText}>Cargando películas...</Text>
        </View>
      ) : movies.error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{movies.error}</Text>
        </View>
      ) : (
        <FlatList
          data={movies.list}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image source={{ uri: item.posterUrl }} style={styles.poster} />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rowMeta}>
                  {item.year} · {item.genre} · ⭐ {item.rating}
                  {item.featured ? ' · destacada' : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddMovie', { movieId: item.id })}
                hitSlop={8}
                style={styles.rowIcon}
              >
                <Ionicons name="create-outline" size={20} color={colors.accentSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(item)} hitSlop={8} style={styles.rowIcon}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
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
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  centered: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 10,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginBottom: 8,
  },
  poster: {
    width: 40,
    height: 60,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
  },
  rowBody: {
    flex: 1,
    marginLeft: 10,
  },
  rowTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  rowIcon: {
    marginLeft: 12,
  },
});

export default ManageMoviesScreen;
