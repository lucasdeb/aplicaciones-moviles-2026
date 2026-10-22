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
  Platform,
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
  mockUpdateComment,
  mockLikeComment,
  mockRepostComment,
  mockDeleteComment,
} from '../mockData';
import CommentCard from '../components/CommentCard';
import { colors, fonts } from '../theme';
import { pickPhoto } from '../utils/pickPhoto';
import StarRatingInput from '../components/StarRatingImput';


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
  const [rating, setRating] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [savingReview, setSavingReview] = useState(false);
  const [composerError, setComposerError] = useState('');

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
    const result = await mockLikeComment(commentId, me.id);
    replaceComment(result.comment);
    return result.liked; 
  }

  async function repostComment(commentId, userId) {
    const result = await mockRepostComment(
      commentId,
      userId
    );

    replaceComment(result.comment);

    return result.reposted;
  }

  async function deleteComment(commentId) {
    try {
      await mockDeleteComment(commentId, me.id);
      if (editingReviewId === commentId) resetComposer();
      await loadMovie();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  const me = user.user;
  const canModerate = me?.role === 'moderator' || me?.role === 'superadmin';
  const myReview = me ? comments.find((comment) => comment.author?.id === me.id) : null;
  const isEditingMyReview = Boolean(myReview && editingReviewId === myReview.id);
  const requireLogin = (fn) => () => (me ? fn() : navigation.navigate('Login'));
  function openAuthor(authorId?: number) {
  if (!authorId) return;
  if (authorId === me?.id) navigation.navigate('Main', { screen: 'Profile' });
  else navigation.push('UserProfile', { userId: authorId });
}
  async function attach(source: 'camera' | 'gallery') {
    const uri = await pickPhoto(source);
    if (uri) setPhoto(uri);
  }

  function handleAddPhoto() {
  if (Platform.OS === 'web') {
    attach('gallery');
    return;
  }
  Alert.alert('Agregar foto', 'Sacale una foto al póster o elegí una de tu galería', [
    { text: 'Cámara', onPress: () => attach('camera') },
    { text: 'Galería', onPress: () => attach('gallery') },
    { text: 'Cancelar', style: 'cancel' },
  ]);
}

  const missing = [
    !rating && 'puntaje',
    !commentText.trim() && 'texto',
    !photo && 'foto',
  ].filter(Boolean);
  const canPublish = missing.length === 0;

  function resetComposer() {
    setCommentText('');
    setPhoto(null);
    setRating(null);
    setEditingReviewId(null);
    setComposerError('');
  }

  function startEditingReview() {
    if (!myReview) return;
    setCommentText(myReview.text);
    setPhoto(myReview.photo ?? null);
    setRating(myReview.rating ?? null);
    setEditingReviewId(myReview.id);
    setComposerError('');
  }

  async function handlePublish() {
    if (!canPublish || !me || savingReview) return;
    setSavingReview(true);
    setComposerError('');
    try {
      if (isEditingMyReview) {
        await mockUpdateComment(editingReviewId, me.id, {
          text: commentText.trim(),
          rating,
          photo,
        });
      } else {
        await mockPostComment(movieId, me.id, commentText.trim(), rating, photo);
      }
      resetComposer();
      await loadMovie();
    } catch (e) {
      setComposerError(e.message || 'No se pudo guardar la reseña.');
      if (e.code === 'REVIEW_ALREADY_EXISTS') await loadMovie();
    } finally {
      setSavingReview(false);
    }
  }
const rated = comments.filter((c) => c.rating !== null && c.rating !== undefined);
const communityAvg = rated.length
  ? (rated.reduce((sum, c) => sum + c.rating, 0) / rated.length).toFixed(1)
  : '–';


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
            <Text style={styles.sectionTitle}>Reseñas</Text>
          </View>
          <View style={styles.ratingSummary}>
            <Ionicons name="star" size={14} color={colors.rating} />
            <Text style={styles.ratingSummaryText}>{communityAvg}</Text>
            <Text style={styles.ratingSummaryCount}>({rated.length})</Text>
          </View>
        </View>

        {me && myReview && !isEditingMyReview ? (
          <View style={styles.existingReviewNotice}>
            <View style={styles.existingReviewIcon}>
              <Ionicons name="checkmark" size={18} color={colors.onAccentPrimary} />
            </View>
            <View style={styles.existingReviewCopy}>
              <Text style={styles.existingReviewTitle}>Ya reseñaste esta película</Text>
              <Text style={styles.existingReviewText}>
                Podés editar tu reseña actual o borrarla para publicar una nueva.
              </Text>
            </View>
            <TouchableOpacity style={styles.editReviewButton} onPress={startEditingReview} activeOpacity={0.8}>
              <Ionicons name="pencil-outline" size={15} color={colors.accentPrimary} />
              <Text style={styles.editReviewButtonText}>Editar</Text>
            </TouchableOpacity>
          </View>
        ) : me ? (
          <View style={styles.composer}>
            <View style={styles.composerHeader}>
              <LinearGradient
                colors={[colors.accentPrimary, colors.accentSecondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.composerAvatar}
              >
                <Text style={styles.composerAvatarInitial}>{me.name.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
              <View>
                <Text style={styles.composerTitle}>
                  {isEditingMyReview ? 'Editá tu reseña' : 'Tu reseña'}
                </Text>
                <Text style={styles.composerSubtitle}>
                  {isEditingMyReview ? 'Los cambios no cuentan como una reseña nueva' : `¿Qué te pareció ${movie.title}?`}
                </Text>
              </View>
            </View>

            <StarRatingInput value={rating} onChange={setRating} />

            <TextInput
              style={styles.commentInput}
              placeholder="Contá qué te gustó, qué no, a quién se la recomendarías..."
              placeholderTextColor={colors.textMuted}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              textAlignVertical="top"
            />

            {photo && (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photo }} style={styles.photoPreviewImage} />
                <TouchableOpacity style={styles.photoRemove} onPress={() => setPhoto(null)} hitSlop={8}>
                  <Ionicons name="close" size={14} color={colors.text} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.composerFooter}>
              <TouchableOpacity style={styles.photoButton} onPress={handleAddPhoto} activeOpacity={0.8}>
                <Ionicons name={photo ? 'images-outline' : 'camera-outline'} size={16} color={colors.accentPrimarySoft} />
                <Text style={styles.photoButtonText}>{photo ? 'Cambiar foto' : 'Agregar foto'}</Text>
              </TouchableOpacity>
              <View style={styles.composerSubmitActions}>
                {isEditingMyReview && (
                  <TouchableOpacity style={styles.cancelEditButton} onPress={resetComposer} disabled={savingReview}>
                    <Text style={styles.cancelEditButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.sendButton, (!canPublish || savingReview) && styles.sendButtonDisabled]}
                  onPress={handlePublish}
                  disabled={!canPublish || savingReview}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sendButtonText, (!canPublish || savingReview) && styles.sendButtonTextDisabled]}>
                    {savingReview ? 'Guardando...' : isEditingMyReview ? 'Guardar' : 'Publicar'}
                  </Text>
                  {!savingReview && (
                    <Ionicons
                      name={isEditingMyReview ? 'checkmark' : 'send'}
                      size={14}
                      color={canPublish ? colors.onAccentPrimary : colors.textMuted}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {composerError ? (
              <Text style={styles.composerError}>{composerError}</Text>
            ) : !canPublish ? (
              <Text style={styles.composerHint}>Falta: {missing.join(', ')}</Text>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.login}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={16} color={colors.accentPrimary} />
            <Text style={styles.loginText}>Iniciá sesión para reseñar</Text>
          </TouchableOpacity>
        )}

        {loadingComments ? (
          <ActivityIndicator color={colors.accentPrimary} style={{ marginTop: 16 }} />
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onPressAuthor={() => openAuthor(comment.author?.id)}
              onLike={requireLogin(() => likeComment(comment.id))}
              initialLiked={me?.likes?.includes(comment.id) ?? false} 
              onRepost={requireLogin(() => repostComment(comment.id, me?.id))}
              canDelete={canModerate || comment.author.id === me?.id}
              onDelete={() => deleteComment(comment.id)}
              initialReposted={me?.reposts?.includes(comment.id) ?? false}
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
  existingReviewNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  existingReviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  existingReviewCopy: {
    flex: 1,
  },
  existingReviewTitle: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  existingReviewText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  editReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
  },
  editReviewButtonText: {
    color: colors.accentPrimary,
    fontFamily: fonts.label,
    fontSize: 12,
  },
  composer: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  composerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  composerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  composerAvatarInitial: {
    color: colors.onAccentPrimary,
    fontFamily: fonts.title,
    fontSize: 15,
  },
  composerTitle: {
    color: colors.text,
    fontFamily: fonts.title,
    fontSize: 15,
  },
  composerSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 1,
  },
  commentInput: {
    backgroundColor: colors.surfaceHigh,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 96,
    maxHeight: 180,
    marginBottom: 12,
  },
  composerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  composerSubmitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelEditButton: {
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  cancelEditButtonText: {
    color: colors.textMuted,
    fontFamily: fonts.label,
    fontSize: 13,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  photoButtonText: {
    color: colors.accentPrimarySoft,
    fontFamily: fonts.label,
    fontSize: 13,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.accentPrimary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceHigh,
  },
  sendButtonText: {
    color: colors.onAccentPrimary,
    fontFamily: fonts.label,
    fontSize: 14,
  },
  sendButtonTextDisabled: {
    color: colors.textMuted,
  },
  composerHint: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'right',
  },
  composerError: {
    color: colors.danger,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'right',
  },
  loginText: {
    color: colors.accentPrimary,
    fontFamily: fonts.bodySemiBold,
    marginLeft: 6,
  },
  photoPreview: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  photoPreviewImage: {
    width: 120,
    height: 90,
    borderRadius: 10,
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
