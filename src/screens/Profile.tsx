import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, Pressable,
  ActivityIndicator, Alert,                                   
  StyleSheet,
} from 'react-native';
import { colors, fonts } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { useOnFocus } from '../hooks/useOnFocus';
import { formatNumber } from '../utils/formatNumber';
import BrandLogo from '../components/BrandLogo';
import GuestPrompt from '../components/GuestPrompt';
import SettingsButton from '../components/SettingsButton';
import ReviewCard from '../components/ReviewCard';            
import { RANKS, calculateRank } from '../utils/ranks';
import {
  mockGetPublicProfile,
  mockRepostComment,
  mockGetFriendshipStatus,
  mockSendFriendRequest,
  mockRespondFriendRequest,
  mockRemoveFriendship,
  mockGetPendingRequests,
  mockGetFriends,
} from '../mockData';

const TABS = [
  { key: 'comments', label: 'Reseñas' },
  { key: 'likes', label: 'Likes' },
  { key: 'reposts', label: 'Reposteados' },
] as const;

type ActivityTab = (typeof TABS)[number]['key'];

const FRIEND_BUTTON = {
  none:     { label: 'Agregar amigo',     icon: 'person-add-outline', primary: true },
  sent:     { label: 'Solicitud enviada', icon: 'time-outline',       primary: false },
  received: { label: 'Aceptar',           icon: 'checkmark',          primary: true },
  friends:  { label: 'Amigos',            icon: 'people',             primary: false },
} as const;

type FriendStatus = keyof typeof FRIEND_BUTTON;

const ROLE_LABELS = {
  user: 'Usuario',
  moderator: 'Moderador',
  superadmin: 'Superadmin',
};

const ROLE_COLORS = {
  user: colors.textMuted,
  moderator: colors.accentSecondary,
  superadmin: colors.accentPrimarySoft,
};


type StatCardProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  value: string;
  label: string;
  onPress: () => void;
};

type CommentCardProps = {
  commentId: string;
  authorName: string;
  text: string;
  createdAt: string;
  likes: number;
  reposts: number;
  onPress: () => void;
};


function StatCard({ icon, color, value, label, onPress }: StatCardProps) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.statTop}>
        <Ionicons name={icon} size={18} color={color} />
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

type RanksModalProps = {
  visible: boolean;
  currentRankIndex: number;
  reviews: number;
  onClose: () => void;
};

function RanksModal({ visible, currentRankIndex, reviews, onClose }: RanksModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Rangos</Text>
          <Text style={styles.sheetSubtitle}>Publicaste {reviews} {reviews === 1 ? 'reseña' : 'reseñas'}</Text>

          {RANKS.map((rank, index) => {
            const isCurrent = index === currentRankIndex;
            const reached = index <= currentRankIndex;
            return (
              <View key={rank.name} style={[styles.levelRow, isCurrent && styles.levelRowCurrent]}>
                <View style={[styles.levelIcon, reached && styles.levelIconReached]}>
                  <Ionicons
                    name={reached ? rank.icon : 'lock-closed'}
                    size={18}
                    color={reached ? colors.background : colors.textMuted}
                  />
                </View>
                <View style={styles.levelBody}>
                  <View style={styles.levelHeader}>
                    <Text style={styles.levelName}>{rank.name}</Text>
                    {isCurrent && <Text style={styles.currentTag}>Tu rango</Text>}
                  </View>
                  <Text style={styles.levelMin}>Desde {rank.min} reseñas</Text>
                </View>
              </View>
            );
          })}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type MenuRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  onPress: () => void;
};

function MenuRow({ icon, title, onPress }: MenuRowProps) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={18} color={colors.accentPrimarySoft} />
      </View>
      <Text style={styles.menuText}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function ProfileScreen({ navigation, route }) {
  const { user } = useAuth();
  const { achievements, rewards, fetchAchievements } = useGamification();
  const me = user.user;

  // ---------- ¿Qué perfil muestro? ----------
  const paramUserId = route.params?.userId;     // solo viene al abrirse desde un comentario
  const isTab = paramUserId === undefined;      // ¿me abrieron desde la pestaña Perfil?
  const targetId = paramUserId ?? me?.id;       // dueño del perfil que se muestra
  const isOwn = !!me && targetId === me.id;     // ¿es mi propio perfil?

  // ---------- Estado ----------
  const [profile, setProfile] = useState(null);                 // datos públicos (de quien sea)
  const [friendship, setFriendship] = useState<{ status: FriendStatus; requestId?: number }>({ status: 'none' });
  const [requests, setRequests] = useState([]);                 // solo en mi perfil
  const [friends, setFriends] = useState([]);                   // solo en mi perfil
  const [tab, setTab] = useState<ActivityTab>('comments');
  const [ranksVisible, setRanksVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);                      // evita doble toque en el botón de amistad
  const scrollRef = useRef<ScrollView>(null);
  const [reviewsSectionY, setReviewsSectionY] = useState(0);

  // ---------- Carga: todo en paralelo ----------
  async function load() {
    if (targetId === undefined) {        // pestaña Perfil sin sesión: no hay nada que cargar
      setLoading(false);
      return;
    }
    setError('');
    try {
      const [data, relation, pending, friendList] = await Promise.all([
        mockGetPublicProfile(targetId),
        me && !isOwn ? mockGetFriendshipStatus(me.id, targetId) : Promise.resolve({ status: 'none' as FriendStatus }),
        isOwn ? mockGetPendingRequests(me.id) : Promise.resolve([]),
        isOwn ? mockGetFriends(me.id) : Promise.resolve([]),
      ]);
      setProfile(data);
      setFriendship(relation as { status: FriendStatus; requestId?: number });
      setRequests(pending);
      setFriends(friendList);
      if (isOwn) fetchAchievements();    // ← mis logros (para la tarjeta de logros)
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useOnFocus(load, [targetId, me?.id]);

  // ---------- Navegación ----------
  // push (no navigate): siempre apila una pantalla nueva, así "atrás" deshace el camino en orden
  function openMovie(movieId?: number) {
    if (movieId) navigation.push('MovieDetail', { movieId });
  }
  function openUser(userId?: number) {
    if (userId) navigation.push('UserProfile', { userId });
  }

  function openActivityTab(nextTab: ActivityTab) {
    setTab(nextTab);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(reviewsSectionY - 16, 0), animated: true });
    });
  }

  // ---------- Amistad (perfil de otro) ----------
  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setBusy(false);
    }
  }

  function changeFriendsCount(delta: number) {
    setProfile((p) => ({ ...p, stats: { ...p.stats, friends: p.stats.friends + delta } }));
  }

  function handleFriendPress() {
    if (!me) return navigation.navigate('Login');   // sin sesión no se puede pedir amistad

    if (friendship.status === 'none') {
      return run(async () => {
        const request = await mockSendFriendRequest(me.id, targetId);
        setFriendship({ status: 'sent', requestId: request.id });
      });
    }
    if (friendship.status === 'received') {
      return run(async () => {
        await mockRespondFriendRequest(friendship.requestId, true);
        setFriendship({ status: 'friends', requestId: friendship.requestId });
        changeFriendsCount(+1);
      });
    }
    // 'sent' o 'friends': pedir confirmación antes de deshacer
    const isFriend = friendship.status === 'friends';
    Alert.alert(
      isFriend ? 'Eliminar amigo' : 'Cancelar solicitud',
      isFriend ? `¿Querés dejar de ser amigo de ${profile.user.name}?` : '¿Querés cancelar la solicitud de amistad?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: isFriend ? 'Eliminar' : 'Cancelar solicitud',
          style: 'destructive',
          onPress: () => run(async () => {
            await mockRemoveFriendship(friendship.requestId);
            setFriendship({ status: 'none' });
            if (isFriend) changeFriendsCount(-1);
          }),
        },
      ]
    );
  }

  function handleReject() {
    run(async () => {
      await mockRespondFriendRequest(friendship.requestId, false);
      setFriendship({ status: 'none' });
    });
  }

  // ---------- Acciones de mi perfil ----------
  async function respondRequest(requestId: number, accept: boolean) {
    try {
      await mockRespondFriendRequest(requestId, accept);
      await load();                         // recarga solicitudes, amigos y la cantidad de amigos
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async function removeRepost(commentId: number) {
    try {
      const result = await mockRepostComment(commentId, me.id);   // es un interruptor: lo saca
      if (!result.reposted) {
        setProfile((p) => ({
          ...p,
          reposts: p.reposts.filter((c) => c.id !== commentId),
          stats: { ...p.stats, reposts: p.stats.reposts - 1 },
        }));
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  // ---------- Pestaña Perfil sin sesión: igual que antes ----------
  if (isTab && !user.isLoggedIn) {
    return (
      <GuestPrompt
        title="Tu perfil de cine"
        description="Iniciá sesión para ver tus reseñas, subir de nivel y canjear premios."
        onLogin={() => navigation.navigate('Login')}
      />
    );
  }

  // ---------- Cargando / error ----------
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentPrimary} />
      </View>
    );
  }
  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{error || 'No se pudo cargar el perfil'}</Text>
      </View>
    );
  }

  // ---------- Datos que se muestran ----------
  // Lo privado (email) sale de "me" SOLO si es mi perfil. Lo de otro sale del perfil público.
  const shownUser = isOwn ? me : profile.user;
  const role = shownUser.role || 'user';
  const isSuperadmin = isOwn && role === 'superadmin';
  const isModerator = isOwn && (role === 'moderator' || isSuperadmin);
  const earnedPoints = profile.stats.points;                                  // ganados con logros
  const shownPoints = isOwn ? earnedPoints - rewards.spentPoints : earnedPoints; // los canjes solo se restan en el mio
  const reviewCount = profile.stats.comments;
  // Api va a agarrar el rank pero por ahora esta como mock
  const rank = profile.rank ?? calculateRank(reviewCount);
  const unlockedCount = achievements.list.filter((a) => a.unlocked).length;
  const list = tab === 'reposts'
    ? profile.reposts
    : tab === 'likes'
      ? [...profile.comments].sort((a, b) => b.likes - a.likes)
      : profile.comments;
  const button = FRIEND_BUTTON[friendship.status];

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={[styles.content, !isTab && styles.contentStacked]}
    >
      <LinearGradient colors={[colors.coverTop, colors.background]} style={styles.cover} />
      {isTab && (
        <View style={styles.topRow}>
          <BrandLogo size={36} />
          <Text style={styles.topTitle}>Perfil</Text>
          <SettingsButton />
        </View>
      )}

      {/* ---------- Tarjeta principal (igual para todos) ---------- */}
      <View style={styles.card}>
        <LinearGradient
          colors={[colors.accentPrimary, colors.rating]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarRing}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{(shownUser.name || '?').charAt(0).toUpperCase()}</Text>
          </View>
        </LinearGradient>

        <View style={styles.nameRow}>
          <Text style={styles.name}>{shownUser.name}</Text>
          {rank.current && (
            <TouchableOpacity
              style={styles.rankBadge}
              onPress={() => setRanksVisible(true)}
              activeOpacity={0.8}
              accessibilityLabel={`Rango ${rank.current.name}`}
            >
              <Ionicons name={rank.current.icon} size={14} color={colors.background} />
              <Text style={styles.rankBadgeText}>{rank.current.name}</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.friendsLine}>
          {profile.stats.friends} {profile.stats.friends === 1 ? 'amigo' : 'amigos'}
        </Text>

        <View style={styles.chips}>
          <View style={[styles.roleChip, { borderColor: ROLE_COLORS[role] }]}>
            <Text style={[styles.roleChipText, { color: ROLE_COLORS[role] }]}>{ROLE_LABELS[role]}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.levelBox} onPress={() => setRanksVisible(true)} activeOpacity={0.8}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(rank.progress * 100)}%` }]} />
          </View>
          <Text style={styles.levelHint}>
            {rank.next ? `${rank.next.min - reviewCount} reseñas para ${rank.next.name}` : 'Alcanzó el rango máximo'}
            <Text style={styles.levelLink}>  ·  Ver rangos</Text>
          </Text>
        </TouchableOpacity>

        {/* Botón de amistad: solo en el perfil de otro */}
        {!isOwn && (
          <>
            <View style={styles.friendRow}>
              <TouchableOpacity
                style={[styles.friendButton, button.primary ? styles.friendPrimary : styles.friendSecondary]}
                onPress={handleFriendPress}
                disabled={busy}
                activeOpacity={0.8}
              >
                {busy ? (
                  <ActivityIndicator size="small" color={colors.onAccentPrimary} />
                ) : (
                  <>
                    <Ionicons name={button.icon} size={16} color={button.primary ? colors.onAccentPrimary : colors.text} />
                    <Text style={[styles.friendText, !button.primary && { color: colors.text }]}>{button.label}</Text>
                  </>
                )}
              </TouchableOpacity>
              {friendship.status === 'received' && !busy && (
                <TouchableOpacity style={[styles.friendButton, styles.friendSecondary]} onPress={handleReject}>
                  <Text style={[styles.friendText, { color: colors.text }]}>Rechazar</Text>
                </TouchableOpacity>
              )}
            </View>
            {friendship.status === 'received' && (
              <Text style={[styles.hint, { marginTop: 8 }]}>{shownUser.name} te envió una solicitud de amistad</Text>
            )}
          </>
        )}
      </View>

      {/* ---------- Estadísticas (4 tarjetas, 2x2) ---------- */}
      <Text style={styles.sectionTitle}>Estadísticas</Text>
      <View style={styles.stats}>
        <StatCard
          icon="chatbubbles"
          color={colors.accentPrimarySoft}
          value={formatNumber(profile.stats.comments)}
          label="Reseñas"
          onPress={() => openActivityTab('comments')}
        />
        <StatCard
          icon="repeat"
          color={colors.accentSecondaryText}
          value={formatNumber(profile.stats.reposts)}
          label="Reposteados"
          onPress={() => openActivityTab('reposts')}
        />
        <StatCard
          icon="heart"
          color={colors.rating}
          value={formatNumber(profile.stats.likesReceived)}
          label="Likes recibidos"
          onPress={() => openActivityTab('likes')}
        />
        <StatCard
          icon="diamond"
          color={colors.accentSecondaryText}
          value={formatNumber(shownPoints)}
          label="Puntos"
          onPress={() => (isOwn ? navigation.navigate('Logros') : setRanksVisible(true))}
        />
      </View>

      {/* ---------- Solo en MI perfil ---------- */}
      {isOwn && (
        <>
          <TouchableOpacity style={styles.achievementsCard} onPress={() => navigation.navigate('Logros')} activeOpacity={0.85}>
            <View style={styles.trophy}>
              <Ionicons name="trophy" size={22} color={colors.rating} />
            </View>
            <View style={styles.achievementsBody}>
              <Text style={styles.achievementsTitle}>{unlockedCount} logros desbloqueados</Text>
              <Text style={styles.achievementsText}>de {achievements.list.length} · Ver logros y premios</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {requests.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Solicitudes de amistad ({requests.length})</Text>
              {requests.map((r) => (
                <View key={r.id} style={styles.requestRow}>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => openUser(r.from.id)}>
                    <Text style={styles.requestName}>{r.from.name}</Text>
                    <Text style={styles.hint}>quiere ser tu amigo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.acceptButton} onPress={() => respondRequest(r.id, true)}>
                    <Ionicons name="checkmark" size={18} color={colors.onAccentPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton} onPress={() => respondRequest(r.id, false)}>
                    <Ionicons name="close" size={18} color={colors.text} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          <Text style={styles.sectionTitle}>Amigos ({friends.length})</Text>
          {friends.length === 0 ? (
            <Text style={styles.hint}>Todavía no tenés amigos. Tocá el nombre de alguien en una reseña para agregarlo.</Text>
          ) : (
            friends.map((f) => (
              <TouchableOpacity key={f.id} style={styles.requestRow} onPress={() => openUser(f.id)}>
                <Text style={[styles.requestName, { flex: 1 }]}>{f.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))
          )}

          {isModerator && (
            <>
              <Text style={styles.sectionTitle}>Zona de moderación</Text>
              {isSuperadmin ? (
                <>
                  <MenuRow icon="film-outline" title="Administrar películas" onPress={() => navigation.navigate('ManageMovies')} />
                  <MenuRow icon="people-outline" title="Administrar usuarios" onPress={() => navigation.navigate('ManageUsers')} />
                </>
              ) : (
                <Text style={styles.hint}>
                  Como moderador podés borrar cualquier reseña desde el detalle de cada película.
                </Text>
              )}
            </>
          )}
        </>
      )}

      {/* ---------- Reseñas / Likes / Reposteados (para todos) ---------- */}
      <View
        style={styles.segment}
        onLayout={(event) => setReviewsSectionY(event.nativeEvent.layout.y)}
      >
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.segmentItem, tab === t.key && styles.segmentItemActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.segmentText, tab === t.key && styles.segmentTextActive]}>
              {t.key === 'comments' && isOwn ? 'Mis reseñas' : t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {list.length === 0 ? (
        <Text style={styles.hint}>
          {tab === 'reposts'
            ? 'Todavía no hay reposteos.'
            : tab === 'likes'
              ? 'Todavía no hay reseñas con likes.'
              : 'Todavía no hay reseñas.'}
        </Text>
      ) : (
        list.map((comment) => (
          <View key={comment.id} style={styles.repostItem}>
            {tab === 'reposts' && (
              <View style={styles.repostHeader}>
                <Ionicons name="repeat" size={14} color={colors.accentSecondaryText} />
                <TouchableOpacity style={{ flex: 1 }} onPress={() => openUser(comment.author?.id)}>
                  <Text style={styles.repostLabel}>Reseña de {comment.author?.name ?? 'Usuario'}</Text>
                </TouchableOpacity>
                {isOwn && (
                  <TouchableOpacity onPress={() => removeRepost(comment.id)} hitSlop={8}>
                    <Text style={styles.removeRepost}>Quitar</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {/* Tocar la reseña abre la película donde se publicó */}
            <ReviewCard review={comment} onPress={() => openMovie(comment.movie?.id)} />
          </View>
        ))
      )}

      <RanksModal
        visible={ranksVisible}
        currentRankIndex={rank.index}
        reviews={reviewCount}
        onClose={() => setRanksVisible(false)}
      />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topTitle: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.title,
    marginLeft: 10,
  },
  card: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: colors.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: colors.text,
    fontSize: 40,
    fontFamily: fonts.title,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  name: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.title,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.rating,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginLeft: 8,
  },
  rankBadgeText: {
    color: colors.background,
    fontSize: 11,
    fontFamily: fonts.label,
    marginLeft: 4,
  },
  email: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  roleChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleChipText: {
    fontSize: 12,
    fontFamily: fonts.label,
  },
  levelBox: {
    width: '100%',
    marginTop: 16,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceHigh,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.rating,
  },
  levelHint: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 6,
    textAlign: 'center',
  },
  levelLink: {
    color: colors.rating,
    fontFamily: fonts.label,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surfaceHigh,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.title,
  },
  sheetSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
    marginTop: 2,
    marginBottom: 14,
  },
  levelRow: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelRowCurrent: {
    borderColor: colors.rating,
    backgroundColor: 'rgba(255,193,7,0.08)',
  },
  levelIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelIconReached: {
    backgroundColor: colors.rating,
  },
  levelBody: {
    flex: 1,
    marginLeft: 12,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelName: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.title,
  },
  currentTag: {
    color: colors.background,
    backgroundColor: colors.rating,
    fontSize: 11,
    fontFamily: fonts.label,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  levelMin: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 2,
    marginBottom: 4,
  },
  closeButton: {
    marginTop: 6,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.accentPrimary,
  },
  closeButtonText: {
    color: colors.onAccentPrimary,
    fontSize: 15,
    fontFamily: fonts.label,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.title,
    marginTop: 24,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',          // ← NUEVO: pasa a la línea siguiente
    rowGap: 10,  
  },
  statCard: {
    width: '48%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontFamily: fonts.title,
    marginTop: 8,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  achievementsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rating,
  },
  trophy: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,193,7,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementsBody: {
    flex: 1,
    marginLeft: 12,
  },
  achievementsTitle: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.title,
  },
  achievementsText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(229,9,20,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    marginLeft: 12,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
    lineHeight: 18,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontFamily: fonts.label,
    marginLeft: 8,
  },
  repostItem: { 
    marginBottom: 6 
  },
repostHeader: { 
  flexDirection: 'row',
   alignItems: 'center',
    gap: 6,
     marginBottom: 4
     },
repostLabel: { 
  color: colors.accentSecondaryText, 
  fontFamily: fonts.body, 
  fontSize: 12 },

  contentStacked: { paddingTop: 16 },    
centered: { flex: 1,
   justifyContent: 'center',
    alignItems: 'center',
     backgroundColor: colors.background,
      padding: 24
     },
friendsLine: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, marginTop: 4 },

friendRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 16 },
friendButton: {
  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  borderRadius: 24, paddingVertical: 10, paddingHorizontal: 18, minWidth: 140,
},
friendPrimary: { backgroundColor: colors.accentPrimary },
friendSecondary: { backgroundColor: colors.surfaceHigh, borderWidth: 1, borderColor: colors.border },
friendText: { color: colors.onAccentPrimary, fontFamily: fonts.label, fontSize: 14 },

requestRow: {
  flexDirection: 'row', alignItems: 'center', gap: 10,
  backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginBottom: 8,
},
requestName: { color: colors.text, fontFamily: fonts.label, fontSize: 15 },
acceptButton: { backgroundColor: colors.accentPrimary, borderRadius: 18, padding: 8 },
rejectButton: { backgroundColor: colors.surfaceHigh, borderRadius: 18, padding: 8 },

segment: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, padding: 4, marginTop: 24, marginBottom: 14 },
segmentItem: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
segmentItemActive: { backgroundColor: colors.accentPrimary },
segmentText: { color: colors.textMuted, fontFamily: fonts.label, fontSize: 13 },
segmentTextActive: { color: colors.onAccentPrimary },

removeRepost: { color: colors.danger, fontFamily: fonts.label, fontSize: 12 },

});

export default ProfileScreen;
