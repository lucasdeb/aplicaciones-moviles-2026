import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useOnFocus } from '../hooks/useOnFocus';
import {
  mockGetMovie,
  mockGetRecommendations,
  mockGetComments,
  mockPostComment,
  mockLikeComment,
  mockRepostComment,
  mockDeleteComment,
} from '../mockData';
import CommentCard from '../components/CommentCard';
import { colors, fonts } from '../theme';
import { pickPhoto } from '../utils/pickPhoto';

function MovieDetailScreen({ navigation, route }) {
  const { user } = useAuth();
  const { movieId } = route.params;

  // Solo los usa esta pantalla: estado local. Al salir se descartan solos,
  // por eso ya no hacen falta clearMovieDetail ni clearComments.
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  // Se recarga cada vez que la pantalla queda visible (por ejemplo, al volver de una recomendada)
  useOnFocus(loadMovie, [movieId]);

  async function loadMovie() {
    setError('');
    setLoadingComments(true);
    try {
      const [detail, recs, list] = await Promise.all([
        mockGetMovie(movieId),
        mockGetRecommendations(movieId),
        mockGetComments(movieId),
      ]);
      setMovie(detail);
      setRecommendations(recs);
      setComments(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setLoadingComments(false);
    }
  }

  // Reemplaza en la lista el comentario que devolvió el mock (like / repost)
  function replaceComment(updated) {
    setComments((current) => current.map((c) => (c.id === updated.id ? updated : c)));
  }

  async function likeComment(commentId) {
    replaceComment(await mockLikeComment(commentId));
  }

  async function repostComment(commentId) {
    replaceComment(await mockRepostComment(commentId));
  }

  async function deleteComment(commentId) {
    try {
      await mockDeleteComment(commentId);
      setComments((current) => current.filter((c) => c.id !== commentId));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  const me = user.user;
  const canModerate = me?.role === 'moderator' || me?.role === 'superadmin';
  const requireLogin = (fn) => () => (me ? fn() : navigation.navigate('Login'));

  async function attach(source: 'camera' | 'gallery') {
    const uri = await pickPhoto(source);
    if (uri) setPhoto(uri);
  }

  function handleAddPhoto() {
    Alert.alert('Agregar foto', 'Sacale una foto al póster o elegí una de tu galería', [
      { text: 'Cámara', onPress: () => attach('camera') },
      { text: 'Galería', onPress: () => attach('gallery') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function handlePublish() {
    if (!commentText.trim() || !me) return;
    mockPostComment(movieId, me.id, commentText.trim(), undefined, photo ?? undefined)
      .then((comment) => setComments((current) => [comment, ...current]));
    setCommentText('');
    setPhoto(null);
  }

  return (loading || !movie) && !error ? (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.accentPrimary} />
      <Text style={styles.loadingText}>Cargando película...</Text>
    </View>
  ) : error ? (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  ) : (
    <ScrollView style={styles.container}>
      <ImageBackground
        source={{ uri: movie.backdropUrl || movie.posterUrl }}
        style={styles.hero}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <LinearGradient
          colors={['transparent', 'rgba(10,14,26,0.85)', colors.background]}
          style={styles.heroGradient}
        >
          <Text style={styles.title}>{movie.title}</Text>

          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{movie.year}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{movie.genre}</Text>
            </View>
            <View style={styles.ratingChip}>
              <Ionicons name="star" size={12} color={colors.background} />
              <Text style={styles.ratingChipText}>{movie.rating}</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.content}>
        <Text style={styles.overview}>{movie.overview}</Text>

        {recommendations.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Recomendadas para vos</Text>
            </View>
            <FlatList
              data={recommendations}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 4 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recommendationBox}
                  activeOpacity={0.7}
                  onPress={() => navigation.push('MovieDetail', { movieId: item.id })}
                >
                  <Image source={{ uri: item.posterUrl }} style={styles.recommendationPoster} />
                  <Text style={styles.recommendationTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.recommendationRatingRow}>
                    <Ionicons name="star" size={11} color={colors.accentSecondary} />
                    <Text style={styles.recommendationRating}>{item.rating}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        <View style={[styles.sectionHeader, styles.sectionHeaderRow]}>
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>Comentarios</Text>
          </View>
          <View style={styles.ratingSummary}>
            <Ionicons name="star" size={14} color={colors.rating} />
            <Text style={styles.ratingSummaryText}>{movie.rating}</Text>
            <Text style={styles.ratingSummaryCount}>({comments.length})</Text>
          </View>
        </View>

        {me ? (
          <>
            {photo && (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photo }} style={styles.photoPreviewImage} />
                <TouchableOpacity style={styles.photoRemove} onPress={() => setPhoto(null)} hitSlop={8}>
                  <Ionicons name="close" size={14} color={colors.text} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.commentInputRow}>
              <TouchableOpacity style={styles.cameraButton} onPress={handleAddPhoto} activeOpacity={0.8}>
                <Ionicons name="camera-outline" size={20} color={colors.accentPrimary} />
              </TouchableOpacity>
              <TextInput
                style={styles.commentInput}
                placeholder="Escribí tu opinión..."
                placeholderTextColor={colors.textMuted}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                onPress={handlePublish}
                disabled={!commentText.trim()}
                activeOpacity={0.8}
              >
                <Ionicons name="send" size={16} color={colors.onAccentPrimary} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={styles.login}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={16} color={colors.accentPrimary} />
            <Text style={styles.loginText}>Iniciá sesión para comentar</Text>
          </TouchableOpacity>
        )}

        {loadingComments ? (
          <ActivityIndicator color={colors.accentPrimary} style={{ marginTop: 16 }} />
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onLike={requireLogin(() => likeComment(comment.id))}
              onRepost={requireLogin(() => repostComment(comment.id))}
              canDelete={canModerate || comment.author.id === me?.id}
              onDelete={() => deleteComment(comment.id)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  login: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingVertical: 12,
    marginBottom: 18,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
    marginTop: 10,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontFamily: fonts.body,
    textAlign: 'center',
  },
  hero: {
    width: '100%',
    height: 340,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontFamily: fonts.title,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    color: colors.text,
    fontSize: 12,
    fontFamily: fonts.label,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.rating,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  ratingChipText: {
    color: colors.background,
    fontSize: 12,
    fontFamily: fonts.label,
    marginLeft: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  overview: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.body,
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingSummaryText: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.bodyBold,
    marginLeft: 4,
  },
  ratingSummaryCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    marginLeft: 4,
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
    fontSize: 18,
    fontFamily: fonts.title,
  },
  recommendationBox: {
    width: 130,
    marginRight: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    shadowColor: colors.accentSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendationPoster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },
  recommendationTitle: {
    color: colors.text,
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 6,
  },
  recommendationRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  recommendationRating: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
    marginLeft: 4,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceAlt,
  },
  loginText: {
    color: colors.accentPrimary,
    fontFamily: fonts.bodySemiBold,
    marginLeft: 6,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  photoPreview: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  photoPreviewImage: {
    width: 90,
    height: 68,
    borderRadius: 8,
  },
  photoRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MovieDetailScreen;
