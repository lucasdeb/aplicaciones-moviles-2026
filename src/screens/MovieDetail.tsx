import { useRef, useState } from 'react';
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
  Linking,
  StyleSheet,
  Platform,
} from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppIcon from '../components/AppIcon';
import { useAuth } from '../context/AuthContext';
import { useOnFocus } from '../hooks/useOnFocus';
import {
  getMovie,
  getRecommendations,
  getComments,
  postComment,
  updateComment,
  likeComment as apiLikeComment,
  repostComment as apiRepostComment,
  deleteComment as apiDeleteComment,
} from '../services/api';
import CommentCard from '../components/CommentCard';
import { colors, fonts } from '../theme';
import { pickPhoto } from '../utils/pickPhoto';
import StarRatingInput from '../components/StarRatingImput';
import { formatRating, getMovieYear, getPrimaryGenre } from '../utils/movieMetadata';

const HERO_HEIGHT = 300;

const CREW_JOB_LABELS = {
  Writer: 'Guion',
  Screenplay: 'Guion',
  'Director of Photography': 'Fotografía',
  'Original Music Composer': 'Música',
  Editor: 'Montaje',
  Producer: 'Producción',
};

const PROVIDER_LOGOS: Record<string, string> = {
  'Amazon Prime Video': 'https://image.tmdb.org/t/p/w92/gMZdpavHmxFNnLpMHwVxfqeux2g.png',
  'Amazon Video': 'https://image.tmdb.org/t/p/w92/jn6TLbtaTZntTRX9UYucHJvpQx1.png',
  'Apple TV Store': 'https://image.tmdb.org/t/p/w92/qdEGArH3lKfFnAtYXMkSYk5wxuG.png',
  'Claro video': 'https://image.tmdb.org/t/p/w92/zTJg0WVErBkcJv4S9FkQRUyXjnq.png',
  'Filmelier Plus Amazon Channel': 'https://image.tmdb.org/t/p/w92/qsa5pNRHmZReAhr4CFBQoaPh253.png',
  'HBO Max': 'https://image.tmdb.org/t/p/w92/skypuy7SXuugIQeYg0IglmzoKaS.png',
  'Lionsgate+ Amazon Channel': 'https://image.tmdb.org/t/p/w92/1356slxu4QrHOMrEVDKHJXRo5sW.png',
  'MovistarTV': 'https://image.tmdb.org/t/p/w92/kxUmV9TCZHfukpVOMuN90Jibbnm.png',
  'Netflix': 'https://image.tmdb.org/t/p/w92/rK1KljqmbvO9HQa1PBFLILWah72.png',
  'Paramount Plus': 'https://image.tmdb.org/t/p/w92/pkx3klJlwW5JdtaulvDx6hDNtch.png',
  'Paramount+ Amazon Channel': 'https://image.tmdb.org/t/p/w92/bxX0YVOCY7bI85BKRlJAAQ2EjUR.png',
  'Universal+ Amazon Channel': 'https://image.tmdb.org/t/p/w92/j3Q750FwRyIejO5MrNu25Kia57.png',
  'ViX Premium Amazon Channel': 'https://image.tmdb.org/t/p/w92/dZn7SR1rarhMVKnO0OXCAvMjbcv.png',
};

function formatReleaseDate(value?: string) {
  if (!value) return 'Sin fecha';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function DetailSectionTitle({ children }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionBar} />
      <Text style={styles.sectionTitle}>{children}</Text>
    </View>
  );
}

const PROVIDER_TYPES = [
  { key: 'stream', tag: null },
  { key: 'rent', tag: 'Alquiler' },
  { key: 'buy', tag: 'Compra' },
] as const;

function ProviderStrip({ providers }) {
  // Una sola fila sin plataformas repetidas; la suscripción tiene prioridad
  const seen = new Set<string>();
  const items = PROVIDER_TYPES.flatMap(({ key, tag }) =>
    ((providers?.[key] ?? []) as string[])
      .filter((name) => !seen.has(name) && seen.add(name))
      .map((name) => ({ name, tag }))
  );

  if (!items.length) {
    return <Text style={styles.noProviders}>No hay opciones informadas para Argentina.</Text>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.providerStrip}>
      {items.map(({ name, tag }) => (
        <View key={name} style={styles.providerItem} accessibilityLabel={tag ? `${name}, ${tag}` : name}>
          {PROVIDER_LOGOS[name] ? (
            <Image source={{ uri: PROVIDER_LOGOS[name] }} style={styles.providerLogo} resizeMode="contain" />
          ) : (
            <View style={styles.providerLogoFallback}>
              <Text style={styles.providerFallbackText} numberOfLines={2}>{name}</Text>
            </View>
          )}
          {tag && <Text style={styles.providerTag}>{tag}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

function MovieDetailScreen({ navigation, route }) {
  const { user } = useAuth();
  const { movieId } = route.params;
  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const reviewsSectionY = useRef(0);
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
        getMovie(movieId),
        getRecommendations(movieId),
        getComments(movieId),
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

  // Reemplaza en la lista el comentario que devolvió el servidor (like / repost)
  function replaceComment(updated) {
    setComments((current) => current.map((c) => (c.id === updated.id ? updated : c)));
  }

  async function likeComment(commentId) {
    const result = await apiLikeComment(commentId, me.id);
    replaceComment(result.comment);
    return result.liked;
  }

  async function repostComment(commentId, userId) {
    const result = await apiRepostComment(
      commentId,
      userId
    );

    replaceComment(result.comment);

    return result.reposted;
  }

  async function deleteComment(commentId) {
    try {
      await apiDeleteComment(commentId, me.id);
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

  function scrollToReviews() {
    scrollViewRef.current?.scrollTo({
      y: Math.max(reviewsSectionY.current - 12, 0),
      animated: true,
    });
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
        await updateComment(editingReviewId, me.id, {
          text: commentText.trim(),
          rating,
          photo,
        });
      } else {
        await postComment(movieId, me.id, commentText.trim(), rating, photo);
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
  const communityAvg = movie?.communityRating === null || movie?.communityRating === undefined ? '–' : movie.communityRating.toFixed(1);
  const argentinaProviders = movie?.watchProviders?.AR;
  const firstTrailer = movie?.trailers?.[0];

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
    <ScrollView ref={scrollViewRef} style={styles.container}>
      <ImageBackground
        source={{ uri: movie.backdropUrl || movie.posterUrl }}
        style={styles.hero}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={8}>
          <AppIcon name="arrow-back" size={20} />
        </TouchableOpacity>

        <LinearGradient
          colors={['transparent', 'rgba(10,14,26,0.85)', colors.background]}
          style={styles.heroGradient}
        >
          <Text style={styles.title}>{movie.title}</Text>

          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{getMovieYear(movie)}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{getPrimaryGenre(movie)}</Text>
            </View>
            <View style={styles.ratingChip}>
              <AppIcon name="star" size={12} tone="movieRating" />
              <Text style={styles.ratingChipText}>{formatRating(movie.communityRating)}</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.content}>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={scrollToReviews}
            activeOpacity={0.8}
          >
            <AppIcon name="chatbubbles-outline" size={16} />
            <Text style={styles.quickActionText}>Reseñas</Text>
            <AppIcon name="arrow-down" size={14} />
          </TouchableOpacity>

          {firstTrailer && (
            <TouchableOpacity
              style={styles.quickActionButton}
              activeOpacity={0.8}
              onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${firstTrailer.key}`)}
            >
              <AppIcon name="play-circle-outline" size={17} />
              <Text style={styles.quickActionText}>Tráiler</Text>
              <AppIcon name="open-outline" size={13} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.summaryRow}>
          <Image source={{ uri: movie.posterUrl }} style={styles.detailPoster} />
          <Text style={styles.overview}>{movie.overview}</Text>
        </View>

        <View style={styles.metadataCard}>
          <View style={styles.metadataCardHeader}>
            <AppIcon name="information-circle-outline" size={19} />
            <Text style={styles.metadataCardTitle}>Información</Text>
          </View>
          <View style={styles.metadataStats}>
            <View style={styles.metadataStat}>
              <AppIcon name="time-outline" size={16} />
              <View>
                <Text style={styles.metadataLabel}>Duración</Text>
                <Text style={styles.metadataValue}>
                  {movie.runtime ? `${movie.runtime} min` : 'Sin datos'}
                </Text>
              </View>
            </View>
            <View style={styles.metadataStat}>
              <AppIcon name="calendar-outline" size={16} />
              <View>
                <Text style={styles.metadataLabel}>Estreno</Text>
                <Text style={styles.metadataValue}>{formatReleaseDate(movie.releaseDate)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.metadataRow}>
            <Text style={styles.metadataRowLabel}>Géneros</Text>
            <Text style={styles.metadataRowValue}>
              {movie.genres?.join(' · ') || 'Sin género'}
            </Text>
          </View>
          {movie.directors?.length > 0 && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataRowLabel}>Dirección</Text>
              <Text style={styles.metadataRowValue}>{movie.directors.join(' · ')}</Text>
            </View>
          )}
          {movie.actors?.length > 0 && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataRowLabel}>Reparto</Text>
              <Text style={styles.metadataRowValue}>
                {movie.actors
                  .map((actor) => `${actor.name} como ${actor.character}`)
                  .join(' · ')}
              </Text>
            </View>
          )}
          {movie.crew?.length > 0 && (
            <View style={[styles.metadataRow, styles.metadataRowLast]}>
              <Text style={styles.metadataRowLabel}>Equipo</Text>
              <Text style={styles.metadataRowValue}>
                {movie.crew
                  .map((member) => `${CREW_JOB_LABELS[member.job] ?? member.job}: ${member.name}`)
                  .join(' · ')}
              </Text>
            </View>
          )}
        </View>

        <DetailSectionTitle>Dónde ver</DetailSectionTitle>
        <ProviderStrip providers={argentinaProviders} />
        <Text style={styles.providersUpdated}>En Argentina · la disponibilidad puede cambiar</Text>

        {recommendations.length > 0 && (
          <>
            <DetailSectionTitle>Recomendadas para vos</DetailSectionTitle>
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
                    <AppIcon name="star" size={11} tone="movieRating" />
                    <Text style={styles.recommendationRating}>{formatRating(item.communityRating)}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        <View
          style={[styles.sectionHeader, styles.sectionHeaderRow]}
          onLayout={({ nativeEvent }) => {
            reviewsSectionY.current = HERO_HEIGHT + nativeEvent.layout.y;
          }}
        >
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>Reseñas</Text>
          </View>
          <View style={styles.ratingSummary}>
            <AppIcon name="star" size={14} tone="movieRating" />
            <Text style={styles.ratingSummaryText}>{communityAvg}</Text>
            <Text style={styles.ratingSummaryCount}>({movie.ratingsCount})</Text>
          </View>
        </View>

        {me && myReview && !isEditingMyReview ? (
          <View style={styles.existingReviewNotice}>
            <View style={styles.existingReviewIcon}>
              <AppIcon name="checkmark" size={18} />
            </View>
            <View style={styles.existingReviewCopy}>
              <Text style={styles.existingReviewTitle}>Ya reseñaste esta película</Text>
              <Text style={styles.existingReviewText}>
                Podés editar tu reseña actual o borrarla para publicar una nueva.
              </Text>
            </View>
            <TouchableOpacity style={styles.editReviewButton} onPress={startEditingReview} activeOpacity={0.8}>
              <AppIcon name="pencil-outline" size={15} />
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
                  <AppIcon name="close" size={14} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.composerFooter}>
              <TouchableOpacity style={styles.photoButton} onPress={handleAddPhoto} activeOpacity={0.8}>
                <AppIcon name={photo ? 'images-outline' : 'camera-outline'} size={16} />
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
                    <AppIcon
                      name={isEditingMyReview ? 'checkmark' : 'send'}
                      size={14}
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
            <AppIcon name="log-in-outline" size={16} />
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
              initialLiked={comment.liked ?? false}
              onRepost={requireLogin(() => repostComment(comment.id, me?.id))}
              canDelete={canModerate || comment.author.id === me?.id}
              reactionsDisabled={comment.author.id === me?.id}
              onDelete={() => deleteComment(comment.id)}
              initialReposted={comment.reposted ?? false}
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
    height: HERO_HEIGHT,
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
    paddingBottom: 20,
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
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.movieRating,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  ratingChipText: {
    color: colors.movieRating,
    fontSize: 12,
    fontFamily: fonts.label,
    marginLeft: 4,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 48,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minWidth: 118,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.label,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  detailPoster: {
    width: 104,
    aspectRatio: 2 / 3,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  overview: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.body,
    lineHeight: 23,
  },
  metadataCard: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  metadataCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  metadataCardTitle: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.title,
  },
  metadataStats: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  metadataStat: {
    flex: 1,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  metadataLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.label,
    textTransform: 'uppercase',
  },
  metadataValue: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.bodySemiBold,
    marginTop: 3,
  },
  metadataRow: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  metadataRowLast: {
    borderBottomWidth: 0,
  },
  metadataRowLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.label,
    marginBottom: 5,
  },
  metadataRowValue: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.body,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 14,
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
    color: colors.movieRating,
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    marginLeft: 4,
  },
  ratingSummaryCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
    marginLeft: 4,
  },
  sectionBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.accentPrimary,
    marginRight: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.title,
  },
  providersUpdated: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 6,
  },
  providerStrip: {
    gap: 10,
    paddingVertical: 4,
  },
  providerItem: {
    width: 52,
    alignItems: 'center',
  },
  providerLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.text,
  },
  providerLogoFallback: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerFallbackText: {
    color: colors.text,
    fontSize: 8,
    fontFamily: fonts.label,
    textAlign: 'center',
  },
  providerTag: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: fonts.label,
    marginTop: 3,
  },
  noProviders: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.body,
  },
  recommendationBox: {
    width: 138,
    marginRight: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 9,
    shadowColor: colors.accentPrimary,
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
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.body,
    marginTop: 6,
  },
  recommendationRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  recommendationRating: {
    color: colors.movieRating,
    fontSize: 12,
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
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
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
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceHigh,
  },
  sendButtonText: {
    color: colors.accentPrimary,
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
