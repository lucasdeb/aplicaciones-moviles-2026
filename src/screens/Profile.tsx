import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { useOnFocus } from '../hooks/useOnFocus';
import { colors, fonts } from '../theme';
import { formatNumber } from '../utils/formatNumber';
import BrandLogo from '../components/BrandLogo';
import SettingsButton from '../components/SettingsButton';

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

// El nivel sube con los puntos que dan los logros
const LEVELS = [
  {
    min: 0,
    name: 'Espectador',
    icon: 'ticket-outline',
    benefits: ['Reseñar y calificar películas', 'Avisos el día del estreno'],
  },
  {
    min: 50,
    name: 'Cinéfilo',
    icon: 'film-outline',
    benefits: ['Insignia de Cinéfilo en tu perfil', 'Canje de premios en cines adheridos'],
  },
  {
    min: 100,
    name: 'Crítico',
    icon: 'create-outline',
    benefits: ['Tus reseñas pueden aparecer en Reseñas populares', 'Acceso a preventas anticipadas'],
  },
  {
    min: 150,
    name: 'Director',
    icon: 'trophy-outline',
    benefits: ['Premios exclusivos para Directores', 'Prioridad en preventas y estrenos'],
  },
] as const;

function getLevel(points: number) {
  const index = LEVELS.filter((level) => points >= level.min).length - 1;
  const next = LEVELS[index + 1];
  return {
    number: index + 1,
    name: LEVELS[index].name,
    next,
    progress: next ? (points - LEVELS[index].min) / (next.min - LEVELS[index].min) : 1,
  };
}

type StatCardProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  value: string;
  label: string;
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

type LevelsModalProps = {
  visible: boolean;
  currentLevel: number;
  points: number;
  onClose: () => void;
};

function LevelsModal({ visible, currentLevel, points, onClose }: LevelsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Niveles</Text>
          <Text style={styles.sheetSubtitle}>Tenés {points} pts ganados con tus logros</Text>

          {LEVELS.map((level, index) => {
            const number = index + 1;
            const isCurrent = number === currentLevel;
            const reached = number <= currentLevel;
            return (
              <View key={level.name} style={[styles.levelRow, isCurrent && styles.levelRowCurrent]}>
                <View style={[styles.levelIcon, reached && styles.levelIconReached]}>
                  <Ionicons
                    name={reached ? level.icon : 'lock-closed'}
                    size={18}
                    color={reached ? colors.background : colors.textMuted}
                  />
                </View>
                <View style={styles.levelBody}>
                  <View style={styles.levelHeader}>
                    <Text style={styles.levelName}>Nivel {number} · {level.name}</Text>
                    {isCurrent && <Text style={styles.currentTag}>Tu nivel</Text>}
                  </View>
                  <Text style={styles.levelMin}>Desde {level.min} pts</Text>
                  {level.benefits.map((benefit) => (
                    <View key={benefit} style={styles.benefitRow}>
                      <Ionicons
                        name={reached ? 'checkmark-circle' : 'ellipse-outline'}
                        size={14}
                        color={reached ? colors.rating : colors.textMuted}
                      />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
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

function ProfileScreen({ navigation }) {
  const { user, logOut } = useAuth();
  const { achievements, rewards, fetchAchievements } = useGamification();
  const [levelsVisible, setLevelsVisible] = useState(false);

  // Las estadísticas se recalculan al entrar a la solapa
  useOnFocus(fetchAchievements, [user.user?.id]);

  if (!user.isLoggedIn) {
    return (
      <View style={styles.guest}>
        <LinearGradient colors={[colors.coverTop, colors.background]} style={styles.cover} />
        <BrandLogo size={110} />
        <Text style={styles.guestTitle}>Tu perfil de cine</Text>
        <Text style={styles.guestText}>
          Ingresá para ver tus reseñas, subir de nivel y canjear premios en cines adheridos.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>¿No tenés cuenta? Registrate</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const role = user.user?.role || 'user';
  const isSuperadmin = role === 'superadmin';
  const isModerator = role === 'moderator' || isSuperadmin;
  const level = getLevel(achievements.totalPoints);
  const available = achievements.totalPoints - rewards.spentPoints;
  const unlockedCount = achievements.list.filter((a) => a.unlocked).length;
  const profile = achievements.profile;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={[colors.coverTop, colors.background]} style={styles.cover} />

      <View style={styles.topRow}>
        <BrandLogo size={36} />
        <Text style={styles.topTitle}>Perfil</Text>
        <SettingsButton />
      </View>

      <View style={styles.card}>
        <LinearGradient
          colors={[colors.accentPrimary, colors.rating]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarRing}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {(user.user?.name || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
        </LinearGradient>

        <Text style={styles.name}>{user.user?.name}</Text>
        <Text style={styles.email}>{user.user?.email}</Text>

        <View style={styles.chips}>
          <TouchableOpacity style={styles.levelChip} onPress={() => setLevelsVisible(true)} activeOpacity={0.8}>
            <Ionicons name="star" size={12} color={colors.background} />
            <Text style={styles.levelChipText}>Nivel {level.number} · {level.name}</Text>
          </TouchableOpacity>
          <View style={[styles.roleChip, { borderColor: ROLE_COLORS[role] }]}>
            <Text style={[styles.roleChipText, { color: ROLE_COLORS[role] }]}>{ROLE_LABELS[role]}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.levelBox} onPress={() => setLevelsVisible(true)} activeOpacity={0.8}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(level.progress * 100)}%` }]} />
          </View>
          <Text style={styles.levelHint}>
            {level.next
              ? `${level.next.min - achievements.totalPoints} pts para ${level.next.name}`
              : 'Llegaste al nivel máximo'}
            <Text style={styles.levelLink}>  ·  Ver niveles</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Estadísticas</Text>
      <View style={styles.stats}>
        <StatCard
          icon="chatbubbles"
          color={colors.accentPrimarySoft}
          value={String(profile?.reviews ?? 0)}
          label="Reseñas"
          onPress={() => navigation.navigate('UserReviews', { mode: 'reviews' })}
        />
        <StatCard
          icon="heart"
          color={colors.rating}
          value={formatNumber(profile?.likes ?? 0)}
          label="Likes recibidos"
          onPress={() => navigation.navigate('UserReviews', { mode: 'likes' })}
        />
        <StatCard
          icon="diamond"
          color={colors.accentSecondaryText}
          value={String(available)}
          label="Puntos"
          onPress={() => navigation.navigate('Logros')}
        />
      </View>

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
              Como moderador podés borrar cualquier comentario o reseña desde el detalle de cada película.
            </Text>
          )}
        </>
      )}
{/*
      <TouchableOpacity style={styles.logout} onPress={logOut}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
*/}
      <LevelsModal
        visible={levelsVisible}
        currentLevel={level.number}
        points={achievements.totalPoints}
        onClose={() => setLevelsVisible(false)}
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
  name: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.title,
    marginTop: 14,
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
  levelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.rating,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
  },
  levelChipText: {
    color: colors.background,
    fontSize: 12,
    fontFamily: fonts.label,
    marginLeft: 4,
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
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  benefitText: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.body,
    marginLeft: 6,
    flex: 1,
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
  },
  statCard: {
    width: '31%',
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
  guest: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  guestTitle: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.title,
    marginTop: 18,
  },
  guestText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: 6,
  },
  primaryButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.accentPrimary,
  },
  primaryButtonText: {
    color: colors.onAccentPrimary,
    fontSize: 16,
    fontFamily: fonts.label,
  },
  linkText: {
    color: colors.accentSecondaryText,
    fontSize: 14,
    fontFamily: fonts.body,
    marginTop: 16,
  },
});

export default ProfileScreen;
