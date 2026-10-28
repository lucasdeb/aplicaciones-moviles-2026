import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AppIcon from '../components/AppIcon';
import { useMovies } from '../context/MovieContext';
import { pickPhoto } from '../utils/pickPhoto';
import { colors, fonts } from '../theme';

function commaSeparated(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function pairLines(value: string): [string, string][] | null {
  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const pairs = lines.map((line) => line.split('|').map((part) => part.trim()));
  if (!pairs.every(([first, second]) => first && second)) return null;
  return pairs.map(([first, second]) => [first, second]);
}

function pairsToText(items: Array<{ name: string; [field: string]: string }> | undefined, secondField: string) {
  return items?.map((item) => `${item.name} | ${item[secondField]}`).join('\n') ?? '';
}

// aspect es [ancho, alto]: lo usa el recorte del picker y el tamaño del recuadro
function ImageSlot({ label, aspect, value, onChange, required = false }) {
  const [linkInput, setLinkInput] = useState('');
  const [picking, setPicking] = useState(false);
  const aspectRatio = aspect[0] / aspect[1];

  // Se reutiliza pickPhoto en vez de repetir la misma lógica
  async function handlePickFromGallery() {
    setPicking(true);
    try {
      const uri = await pickPhoto('gallery', aspect);
      if (uri) onChange(uri);
    } catch (e) {
      Alert.alert('No se pudo procesar la imagen', 'Probá con otra foto.');
    } finally {
      setPicking(false);
    }
  }

  function handleUseLink() {
    if (!linkInput.trim()) return;
    onChange(linkInput.trim());
    setLinkInput('');
  }

  return (
    <View style={styles.slotContainer}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ' (opcional)'}
      </Text>

      <TouchableOpacity
        style={[styles.imagePicker, { aspectRatio }]}
        onPress={handlePickFromGallery}
        activeOpacity={0.8}
      >
        {picking ? (
          <ActivityIndicator color={colors.accentPrimary} />
        ) : value ? (
          <>
            <Image source={{ uri: value }} style={styles.imagePreview} />
            <View style={styles.imageOverlay}>
              <AppIcon name="camera" size={16} />
              <Text style={styles.imageOverlayText}>Elegir otra de la galería</Text>
            </View>
          </>
        ) : (
          <View style={styles.imagePlaceholder}>
            <AppIcon name="image-outline" size={28} />
            <Text style={styles.imagePlaceholderText}>Tocá para elegir de la galería</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.linkRow}>
        <TextInput
          style={styles.linkInput}
          placeholder="...o pegá un link (https://...)"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          value={linkInput}
          onChangeText={setLinkInput}
        />
        <TouchableOpacity style={styles.linkButton} onPress={handleUseLink}>
          <Text style={styles.linkButtonText}>Usar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AddMovieScreen({ navigation, route }) {
  const { movies, createMovie, updateMovie } = useMovies();
  const movieId = route.params?.movieId;
  const editingMovie = movieId ? movies.list.find((m) => m.id === movieId) : null;
  const argentinaProviders = editingMovie?.watchProviders?.AR;
  const [title, setTitle] = useState(editingMovie?.title || '');
  const [overview, setOverview] = useState(editingMovie?.overview || '');
  const [tmdbId, setTmdbId] = useState(editingMovie?.tmdbId ? String(editingMovie.tmdbId) : '');
  const [releaseDate, setReleaseDate] = useState(editingMovie?.releaseDate || '');
  const [runtime, setRuntime] = useState(editingMovie?.runtime ? String(editingMovie.runtime) : '');
  const [genres, setGenres] = useState(editingMovie?.genres?.join(', ') || '');
  const [actors, setActors] = useState(pairsToText(editingMovie?.actors, 'character'));
  const [directors, setDirectors] = useState(editingMovie?.directors?.join(', ') || '');
  const [crew, setCrew] = useState(pairsToText(editingMovie?.crew, 'job'));
  const [trailers, setTrailers] = useState(pairsToText(editingMovie?.trailers, 'key'));
  const [streamProviders, setStreamProviders] = useState(argentinaProviders?.stream?.join(', ') || '');
  const [rentProviders, setRentProviders] = useState(argentinaProviders?.rent?.join(', ') || '');
  const [buyProviders, setBuyProviders] = useState(argentinaProviders?.buy?.join(', ') || '');
  const [featured, setFeatured] = useState(editingMovie?.featured || false);
  const [posterUrl, setPosterUrl] = useState(editingMovie?.posterUrl || null);
  const [backdropUrl, setBackdropUrl] = useState(editingMovie?.backdropUrl || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    const parsedGenres = commaSeparated(genres);
    if (!title.trim() || !overview.trim() || parsedGenres.length === 0) {
      setError('Completá título, sinopsis y al menos un género');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
      setError('La fecha de estreno debe usar el formato AAAA-MM-DD');
      return;
    }
    const runtimeNumber = Number(runtime);
    if (!Number.isInteger(runtimeNumber) || runtimeNumber <= 0) {
      setError('La duración debe ser una cantidad válida de minutos');
      return;
    }
    if (!editingMovie && !posterUrl) {
      setError('Elegí una imagen para el póster (de la galería o por link)');
      return;
    }

    const actorPairs = pairLines(actors);
    const crewPairs = pairLines(crew);
    const trailerPairs = pairLines(trailers);
    if (!actorPairs || !crewPairs || !trailerPairs) {
      setError('Revisá los campos por línea: cada línea debe contener dos valores separados por |');
      return;
    }

    const parsedTmdbId = tmdbId.trim() ? Number(tmdbId) : null;
    if (parsedTmdbId !== null && (!Number.isInteger(parsedTmdbId) || parsedTmdbId <= 0)) {
      setError('El ID de TMDB debe ser un número válido');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      tmdbId: parsedTmdbId,
      title: title.trim(),
      overview: overview.trim(),
      releaseDate,
      runtime: runtimeNumber,
      genres: parsedGenres,
      actors: actorPairs.map(([name, character]) => ({ name, character })),
      directors: commaSeparated(directors),
      crew: crewPairs.map(([name, job]) => ({ name, job })),
      trailers: trailerPairs.map(([name, key]) => ({ name, key, site: 'YouTube' })),
      watchProviders: {
        AR: {
          stream: commaSeparated(streamProviders),
          rent: commaSeparated(rentProviders),
          buy: commaSeparated(buyProviders),
        },
      },
      featured,
      ...(posterUrl && { posterUrl }),
      ...(backdropUrl && { backdropUrl }),
    };

    const result = editingMovie
        ? await updateMovie(movieId, payload)      
        : await createMovie(payload);

    setSaving(false);
    if (result.success) {
      navigation.goBack();
    } else {
      setError(result.error);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>
        {editingMovie ? 'Editar película' : 'Nueva película'}
      </Text>

      <ImageSlot
        label="Póster"
        aspect={[2, 3]}
        value={posterUrl}
        onChange={setPosterUrl}
        required
      />

      <ImageSlot
        label="Fondo (hero del detalle)"
        aspect={[16, 9]}
        value={backdropUrl}
        onChange={setBackdropUrl}
      />

      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Título de la película"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Overview</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Sinopsis"
        placeholderTextColor={colors.textMuted}
        value={overview}
        onChangeText={setOverview}
        multiline
      />

      <Text style={styles.sectionTitle}>Metadatos</Text>
      <Text style={styles.sectionHint}>
        Los cambios se guardan en el catálogo de WhatNext.
      </Text>

      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.label}>Fecha de estreno</Text>
          <TextInput
            style={styles.input}
            placeholder="2024-03-14"
            placeholderTextColor={colors.textMuted}
            value={releaseDate}
            onChangeText={setReleaseDate}
          />
        </View>
        <View style={styles.inputHalfLast}>
          <Text style={styles.label}>Duración en minutos</Text>
          <TextInput
            style={styles.input}
            placeholder="120"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={runtime}
            onChangeText={setRuntime}
          />
        </View>
      </View>

      <Text style={styles.label}>Géneros</Text>
      <TextInput
        style={styles.input}
        placeholder="Drama, Acción, Ciencia ficción"
        placeholderTextColor={colors.textMuted}
        value={genres}
        onChangeText={setGenres}
      />
      <Text style={styles.fieldHint}>Separalos con comas. El primero se usa como género principal.</Text>

      <Text style={styles.label}>ID de TMDB (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="872585"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        value={tmdbId}
        onChangeText={setTmdbId}
      />

      <Text style={styles.sectionTitle}>Reparto y equipo</Text>

      <Text style={styles.label}>Actores y personajes</Text>
      <TextInput
        style={[styles.input, styles.metadataArea]}
        placeholder={'Cillian Murphy | J. Robert Oppenheimer\nEmily Blunt | Kitty Oppenheimer'}
        placeholderTextColor={colors.textMuted}
        value={actors}
        onChangeText={setActors}
        multiline
        textAlignVertical="top"
      />
      <Text style={styles.fieldHint}>Una persona por línea: Actor | Personaje</Text>

      <Text style={styles.label}>Directores</Text>
      <TextInput
        style={styles.input}
        placeholder="Christopher Nolan"
        placeholderTextColor={colors.textMuted}
        value={directors}
        onChangeText={setDirectors}
      />
      <Text style={styles.fieldHint}>Separalos con comas.</Text>

      <Text style={styles.label}>Equipo</Text>
      <TextInput
        style={[styles.input, styles.metadataArea]}
        placeholder={'Hoyte van Hoytema | Director of Photography\nJennifer Lame | Editor'}
        placeholderTextColor={colors.textMuted}
        value={crew}
        onChangeText={setCrew}
        multiline
        textAlignVertical="top"
      />
      <Text style={styles.fieldHint}>Una persona por línea: Nombre | Rol</Text>

      <Text style={styles.label}>Tráilers de YouTube</Text>
      <TextInput
        style={[styles.input, styles.metadataArea]}
        placeholder="Tráiler oficial | bK6ldnjE3Y0"
        placeholderTextColor={colors.textMuted}
        value={trailers}
        onChangeText={setTrailers}
        multiline
        textAlignVertical="top"
      />
      <Text style={styles.fieldHint}>Uno por línea: Nombre | ID del video de YouTube</Text>

      <Text style={styles.sectionTitle}>Disponibilidad en Argentina</Text>

      <Text style={styles.label}>Con suscripción</Text>
      <TextInput
        style={styles.input}
        placeholder="Netflix, HBO Max, Amazon Prime Video"
        placeholderTextColor={colors.textMuted}
        value={streamProviders}
        onChangeText={setStreamProviders}
      />

      <Text style={styles.label}>Alquiler</Text>
      <TextInput
        style={styles.input}
        placeholder="Apple TV Store, Amazon Video"
        placeholderTextColor={colors.textMuted}
        value={rentProviders}
        onChangeText={setRentProviders}
      />

      <Text style={styles.label}>Compra</Text>
      <TextInput
        style={styles.input}
        placeholder="Apple TV Store, Amazon Video"
        placeholderTextColor={colors.textMuted}
        value={buyProviders}
        onChangeText={setBuyProviders}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Elegida por el equipo (crew pick)</Text>
        <Switch
          value={featured}
          onValueChange={setFeatured}
          trackColor={{ true: colors.accentPrimary }}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color={colors.onAccentPrimary} />
        ) : (
          <Text style={styles.saveButtonText}>
            {editingMovie ? 'Guardar cambios' : 'Crear película'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontFamily: fonts.title,
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.title,
    marginTop: 18,
    marginBottom: 6,
  },
  sectionHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fonts.body,
    marginBottom: 14,
  },
  slotContainer: {
    marginBottom: 18,
  },
  imagePicker: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10,14,26,0.75)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  imageOverlayText: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 6,
    fontFamily: fonts.bodyBold,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePlaceholderText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 8,
    textAlign: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  linkInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 13,
    fontFamily: fonts.body,
  },
  linkButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  linkButtonText: {
    color: colors.accentSecondary,
    fontFamily: fonts.label,
    fontSize: 13,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.label,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  metadataArea: {
    minHeight: 108,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputHalf: {
    flex: 1,
    marginRight: 8,
  },
  inputHalfLast: {
    flex: 1,
    marginLeft: 8,
  },
  fieldHint: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: fonts.body,
    marginTop: -8,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 20,
  },
  switchLabel: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.body,
    flex: 1,
    marginRight: 12,
  },
  error: {
    color: colors.danger,
    marginBottom: 14,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.onAccentPrimary,
    fontFamily: fonts.label,
    fontSize: 16,
  },
});

export default AddMovieScreen;
