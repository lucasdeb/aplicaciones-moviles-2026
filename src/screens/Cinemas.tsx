import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import AppIcon from '../components/AppIcon';
import { colors, fonts } from '../theme';
import { fetchNearbyCinemas, type Cinema } from '../services/cinemas';
import BrandLogo from '../components/BrandLogo';
import SettingsButton from '../components/SettingsButton';

type Status = 'loading' | 'ready' | 'denied' | 'error';

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function CinemasScreen() {
  const [pos, setPos] = useState<Location.LocationObject | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [stale, setStale] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const requestVersion = useRef(0);
  const [status, setStatus] = useState<Status>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [attempt, setAttempt] = useState(0);

  
  useEffect(() => {
    let sub: Location.LocationSubscription | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { status: permission } = await Location.requestForegroundPermissionsAsync();
        if (permission !== 'granted') {
          setStatus('denied');
          return;
        }

        const p = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (cancelled) return;
        setPos(p);

        
        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 500 },
          (next) => setPos(next)
        );
        if (cancelled) sub.remove();
      } catch (e) {
        setStatus('error'); 
      }
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [attempt]);

 
  const c = pos?.coords;

  async function loadCinemas(latitude: number, longitude: number) {
    const version = ++requestVersion.current;
    try {
      const result = await fetchNearbyCinemas(latitude, longitude);
      if (version !== requestVersion.current) return;
      setCinemas(result.cinemas);
      setStale(result.source === 'stale');
      setLookupError('');
      setStatus('ready');
    } catch (e) {
      if (version !== requestVersion.current) return;
      setLookupError(e.message); setStatus('error');
    }

    if (Platform.OS === 'web') return;
    try {
      const [addr] = await Location.reverseGeocodeAsync({ latitude, longitude });
      setPlace(addr ? [addr.district ?? addr.subregion, addr.city].filter(Boolean).join(', ') : null);
    } catch (e) {
      setPlace(null);
    }
  }

  useEffect(() => {
    if (c) loadCinemas(c.latitude, c.longitude);
  }, [c?.latitude, c?.longitude]);

  async function handleRefresh() {
    if (!c) return;
    setRefreshing(true);
    await loadCinemas(c.latitude, c.longitude);
    setRefreshing(false);
  }

  function handleRetry() {
    setStatus('loading');
    if (c) loadCinemas(c.latitude, c.longitude);
    else setAttempt((n) => n + 1); 
  }

  function openDirections(cinema: Cinema) {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${cinema.lat},${cinema.lng}`);
  }

  if (status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentPrimary} />
        <Text style={styles.mutedText}>Buscando cines cerca tuyo...</Text>
      </View>
    );
  }

  if (status === 'denied' || status === 'error') {
    const denied = status === 'denied';
    return (
      <View style={styles.centered}>
        <AppIcon name={denied ? 'location-outline' : 'cloud-offline-outline'} size={40} />
        <Text style={styles.mutedText}>
          {denied
            ? 'Necesitamos tu ubicación para mostrarte los cines cercanos.'
            : lookupError || 'No pudimos cargar los cines. Revisá tu conexión y que el GPS esté prendido.'}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={denied ? () => Linking.openSettings() : handleRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>{denied ? 'Abrir ajustes' : 'Reintentar'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <BrandLogo size={36} />
        <Text style={styles.headerTitle}>Cines cercanos</Text>
        <SettingsButton />
      </View>
      <Text style={styles.subtitle}>
        {place ? `Cerca de ${place} · ordenados por distancia` : 'Ordenados por distancia'}
      </Text>

      {stale ? <Text style={styles.subtitle}>Mostramos la última búsqueda guardada porque el proveedor no está disponible.</Text> : null}
      <Text style={styles.subtitle}>Datos de OpenStreetMap · Ubicación consultada a través de WhatNext</Text>
      <FlatList
        data={cinemas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accentPrimary} />
        }
        ListEmptyComponent={<Text style={styles.mutedText}>No encontramos cines en 15 km a la redonda.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <AppIcon name="film-outline" size={22} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              {item.address && <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text>}
              <Text style={styles.cardDistance}>{formatDistance(item.distanceKm)}</Text>
            </View>
            <TouchableOpacity style={styles.directionsButton} onPress={() => openDirections(item)} activeOpacity={0.8}>
              <AppIcon name="navigate" size={16} />
              <Text style={styles.directionsText}>Ir</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16 },
  headerTitle: { color: colors.text, fontSize: 20, fontFamily: fonts.title, paddingHorizontal: 12 },
  subtitle: { color: colors.textMuted, fontSize: 13, fontFamily: fonts.body, paddingHorizontal: 16, marginTop: 4, marginBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  mutedText: { color: colors.textMuted, fontSize: 13, fontFamily: fonts.body, marginTop: 12, textAlign: 'center' },
  primaryButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  primaryButtonText: { color: colors.onAccentPrimary, fontFamily: fonts.label },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { flex: 1, marginHorizontal: 12 },
  cardTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 14 },
  cardAddress: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.body, marginTop: 2 },
  cardDistance: { color: colors.accentPrimary, fontSize: 12, fontFamily: fonts.bodySemiBold, marginTop: 4 },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  directionsText: { color: colors.accentPrimary, fontFamily: fonts.bodyBold, fontSize: 12, marginLeft: 4 },
});

export default CinemasScreen;
