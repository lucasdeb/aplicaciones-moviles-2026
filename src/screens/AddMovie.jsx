import React, { useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { connectScreen } from '../redux/helpers';
import { colors } from '../theme';

function ImageSlot({ label, aspectRatio, value, onChange, resizeWidth, required }) {
  const [linkInput, setLinkInput] = useState('');
  const [picking, setPicking] = useState(false);

  async function handlePickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Falta permiso', 'Necesitamos acceso a tus fotos para elegir la imagen.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: aspectRatio,
      quality: 0.8,
    });

    if (result.canceled) return;

    setPicking(true);
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: resizeWidth } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      onChange(`data:image/jpeg;base64,${manipulated.base64}`);
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
              <Ionicons name="camera" size={16} color="#fff" />
              <Text style={styles.imageOverlayText}>Elegir otra de la galería</Text>
            </View>
          </>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={28} color={colors.textMuted} />
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

function AddMovieScreen({ navigation, route, movies, user, createMovie, updateMovie }) {
  const movieId = route.params?.movieId;
  const editingMovie = movieId ? movies.list.find((m) => m.id === movieId) : null;

  const [title, setTitle] = useState(editingMovie?.title || '');
  const [overview, setOverview] = useState(editingMovie?.overview || '');
  const [year, setYear] = useState(editingMovie ? String(editingMovie.year) : '');
  const [genre, setGenre] = useState(editingMovie?.genre || '');
  const [rating, setRating] = useState(editingMovie ? String(editingMovie.rating) : '');
  const [featured, setFeatured] = useState(editingMovie?.featured || false);
  const [posterUrl, setPosterUrl] = useState(editingMovie?.posterUrl || null);
  const [backdropUrl, setBackdropUrl] = useState(editingMovie?.backdropUrl || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!title.trim() || !overview.trim() || !genre.trim()) {
      setError('Completá título, overview y género');
      return;
    }
    const yearNumber = Number(year);
    const ratingNumber = Number(rating);
    if (!yearNumber || ratingNumber < 0 || ratingNumber > 5) {
      setError('Año o rating inválido (rating entre 0 y 5)');
      return;
    }
    if (!editingMovie && !posterUrl) {
      setError('Elegí una imagen para el póster (de la galería o por link)');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title: title.trim(),
      overview: overview.trim(),
      year: yearNumber,
      genre: genre.trim(),
      rating: ratingNumber,
      featured,
      ...(posterUrl && { posterUrl }),
      ...(backdropUrl && { backdropUrl }),
    };

    const result = editingMovie
      ? await updateMovie(user.user.id, movieId, payload)
      : await createMovie(user.user.id, payload);

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
        aspectRatio={2 / 3}
        resizeWidth={500}
        value={posterUrl}
        onChange={setPosterUrl}
        required
      />

      <ImageSlot
        label="Fondo (hero del detalle)"
        aspectRatio={16 / 9}
        resizeWidth={800}
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

      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.label}>Año</Text>
          <TextInput
            style={styles.input}
            placeholder="2024"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={year}
            onChangeText={setYear}
          />
        </View>
        <View style={styles.inputHalf}>
          <Text style={styles.label}>Rating (0-5)</Text>
          <TextInput
            style={styles.input}
            placeholder="4.5"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={rating}
            onChangeText={setRating}
          />
        </View>
      </View>

      <Text style={styles.label}>Género</Text>
      <TextInput
        style={styles.input}
        placeholder="Drama, Acción, Comedia..."
        placeholderTextColor={colors.textMuted}
        value={genre}
        onChangeText={setGenre}
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
    fontWeight: 'bold',
    marginBottom: 20,
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
    fontWeight: 'bold',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePlaceholderText: {
    color: colors.textMuted,
    fontSize: 12,
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
  },
  linkButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  linkButtonText: {
    color: colors.accentSecondary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
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
  inputRow: {
    flexDirection: 'row',
  },
  inputHalf: {
    flex: 1,
    marginRight: 8,
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
    fontWeight: 'bold',
    fontSize: 16,
  },
});

function mapStateToProps(state) {
  return { movies: state.movies, user: state.users };
}

export default connectScreen(AddMovieScreen, mapStateToProps);
