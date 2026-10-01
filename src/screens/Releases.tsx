import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme';
import { getNowPlaying, getUpcoming, type TmdbMovie } from '../services/tmdb';
import {
  ensureNotificationPermission,
  getScheduledReminders,
  scheduleReleaseReminder,
  cancelReminder,
} from '../utils/reminders';
import BrandLogo from '../components/BrandLogo';

type Tab = 'upcoming' | 'now';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatDate(iso: string) {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

function ReleasesScreen({ navigation }) {
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [movies, setMovies] = useState<{ upcoming: TmdbMovie[]; now: TmdbMovie[] }>({ upcoming: [], now: [] });
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [reminders, setReminders] = useState<Record<number, string>>({}); // movieId -> id de notificación

  async function load() {
    try {
      const [upcoming, now] = await Promise.all([getUpcoming(), getNowPlaying()]);
      setMovies({ upcoming, now });
      setStatus('ready');
    } catch (e: any) {
      setErrorMsg(e.message);
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
    if (Platform.OS !== 'web') {
      getScheduledReminders()
        .then(setReminders)
        .catch((error) => console.warn('No se pudieron leer los avisos programados', error));
    }
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function toggleReminder(movie: TmdbMovie) {
    if (!user.isLoggedIn) {
      navigation.navigate('Login');
      return;
    }
    if (Platform.OS === 'web') {
      Alert.alert('No disponible', 'Los avisos funcionan solo en el celular.');
      return;
    }

    const existing = reminders[movie.id];
    if (existing) {
      await cancelReminder(existing);
      setReminders(({ [movie.id]: _removed, ...rest }) => rest);
      return;
    }

    const granted = await ensureNotificationPermission();
    if (!granted) {
      Alert.alert('Sin permiso', 'Activá las notificaciones en los ajustes para recibir avisos.');
      return;
    }

    const id = await scheduleReleaseReminder(movie);
    setReminders((current) => ({ ...current, [movie.id]: id }));
    Alert.alert('¡Listo!', `Te avisamos el ${formatDate(movie.releaseDate)} cuando se estrene.`);
  }

  const data = tab === 'upcoming' ? movies.upcoming : movies.now;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <BrandLogo size={36} />
        <Text style={styles.headerTitle}>Estrenos</Text>
      </View>

      <View style={styles.segment}>
        {(['upcoming', 'now'] as Tab[]).map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.segmentItem, tab === key && styles.segmentItemActive]}
            onPress={() => setTab(key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, tab === key && styles.segmentTextActive]}>
              {key === 'upcoming' ? 'Próximamente' : 'En cartelera'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {status === 'loading' ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accentPrimary} />
          <Text style={styles.mutedText}>Cargando estrenos...</Text>
        </View>
      ) : status === 'error' ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
          <Text style={styles.mutedText}>No pudimos cargar los estrenos. {errorMsg}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setStatus('loading');
              load();
            }}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accentPrimary} />
          }
          ListEmptyComponent={<Text style={styles.mutedText}>No hay películas para mostrar.</Text>}
          renderItem={({ item }) => {
            const reminded = !!reminders[item.id];
            return (
              <View style={styles.card}>
                {item.posterUrl ? (
                  <Image source={{ uri: item.posterUrl }} style={styles.poster} />
                ) : (
                  <View style={[styles.poster, styles.posterEmpty]}>
                    <Ionicons name="film-outline" size={24} color={colors.textMuted} />
                  </View>
                )}

                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={12} color={colors.accentSecondary} />
                    <Text style={styles.metaText}>{formatDate(item.releaseDate)}</Text>
                    {item.rating > 0 && (
                      <>
                        <Ionicons name="star" size={12} color={colors.rating} style={{ marginLeft: 10 }} />
                        <Text style={styles.metaText}>{item.rating}</Text>
                      </>
                    )}
                  </View>
                  <Text style={styles.overview} numberOfLines={3}>
                    {item.overview || 'Sin sinopsis disponible.'}
                  </Text>

                  {tab === 'upcoming' && (
                    <TouchableOpacity
                      style={[styles.remindButton, reminded && styles.remindButtonActive]}
                      onPress={() => toggleReminder(item)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={reminded ? 'notifications' : 'notifications-outline'}
                        size={14}
                        color={reminded ? colors.onAccentPrimary : colors.accentPrimary}
                      />
                      <Text style={[styles.remindText, reminded && styles.remindTextActive]}>
                        {reminded ? 'Te vamos a avisar' : 'Avisame'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16 },
  headerTitle: { color: colors.text, fontSize: 20, fontFamily: fonts.title, paddingHorizontal: 12 },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    margin: 16,
    padding: 4,
  },
  segmentItem: { flex: 1, paddingVertical: 8, borderRadius: 18, alignItems: 'center' },
  segmentItemActive: { backgroundColor: colors.accentPrimary },
  segmentText: { color: colors.textMuted, fontFamily: fonts.label, fontSize: 13 },
  segmentTextActive: { color: colors.onAccentPrimary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  mutedText: { color: colors.textMuted, fontSize: 13, fontFamily: fonts.body, marginTop: 12, textAlign: 'center' },
  retryButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  retryText: { color: colors.onAccentPrimary, fontFamily: fonts.bodyBold },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  poster: { width: 80, aspectRatio: 2 / 3, borderRadius: 8, backgroundColor: colors.surfaceAlt },
  posterEmpty: { justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1, marginLeft: 12 },
  cardTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.body, marginLeft: 4 },
  overview: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.body, marginTop: 6, lineHeight: 17 },
  remindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  remindButtonActive: { backgroundColor: colors.accentPrimary },
  remindText: { color: colors.accentPrimary, fontFamily: fonts.bodySemiBold, fontSize: 12, marginLeft: 4 },
  remindTextActive: { color: colors.onAccentPrimary },
});

export default ReleasesScreen;
