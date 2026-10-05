import React from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { useOnFocus } from '../hooks/useOnFocus';
import { REWARDS } from '../mockData';
import { colors, fonts } from '../theme';
import BrandLogo from '../components/BrandLogo';

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  goal: number;
  current: number;
  unlocked: boolean;
};

type Reward = (typeof REWARDS)[number];

type BadgeProps = {
  achievement: Achievement;
};

function Badge({ achievement }: BadgeProps) {
  if (!achievement.unlocked) {
    return (
      <View style={[styles.badge, styles.badgeLocked]}>
        <View style={[styles.badgeIcon, styles.badgeIconLocked]}>
          <Ionicons name="lock-closed" size={18} color={colors.textMuted} />
        </View>
        <Text style={[styles.badgeTitle, styles.mutedText]} numberOfLines={2}>{achievement.title}</Text>
        <Text style={styles.badgeMeta}>{achievement.current}/{achievement.goal}</Text>
      </View>
    );
  }

  return (
    <View style={styles.badge}>
      <View style={styles.badgeIcon}>
        <Ionicons name={achievement.icon as any} size={20} color={colors.rating} />
      </View>
      <Text style={styles.badgeTitle} numberOfLines={2}>{achievement.title}</Text>
      <Text style={styles.badgeMeta}>+{achievement.points} pts</Text>
    </View>
  );
}

function AchievementsScreen({ navigation }) {
  const { user } = useAuth();
  const { achievements, rewards, fetchAchievements, redeemReward } = useGamification();

  // Se recalcula al entrar a la solapa, así refleja las reseñas nuevas
  useOnFocus(fetchAchievements, [user.user?.id]);

  if (!user.isLoggedIn) {
    return (
      <View style={styles.guest}>
        <BrandLogo size={96} />
        <Text style={styles.guestTitle}>Ganá puntos con tus reseñas</Text>
        <Text style={styles.guestText}>
          Iniciá sesión para ver tus logros y canjear premios en cines adheridos.
        </Text>
        <TouchableOpacity style={styles.guestButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.guestButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const list: Achievement[] = achievements.list;
  const available = achievements.totalPoints - rewards.spentPoints;
  const unlockedCount = list.filter((a) => a.unlocked).length;
  const nextGoal = list
    .filter((a) => !a.unlocked)
    .sort((a, b) => b.current / b.goal - a.current / a.goal)[0];
  const nextPercent = nextGoal ? Math.round((nextGoal.current / nextGoal.goal) * 100) : 100;

  const handleRedeem = (reward: Reward) => {
    Alert.alert('Canjear premio', `¿Canjear "${reward.title}" por ${reward.cost} puntos?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Canjear',
        onPress: () => {
          const result = redeemReward(reward);
          if (result.success) Alert.alert('¡Listo!', `Tu código es ${result.code}`);
          else Alert.alert('Error', result.error);
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <BrandLogo size={36} />
          <Text style={styles.headerTitle}>Logros</Text>
        </View>
        <View style={styles.pointsPill}>
          <Ionicons name="diamond-outline" size={14} color={colors.rating} />
          <Text style={styles.pointsText}>{available} pts</Text>
        </View>
      </View>

      {achievements.isFetching && list.length === 0 ? (
        <ActivityIndicator color={colors.accentPrimary} style={styles.loader} />
      ) : (
        <>
          {nextGoal ? (
            <View style={styles.challenge}>
              <View style={styles.challengeCircle}>
                <Text style={styles.challengePercent}>{nextPercent}%</Text>
              </View>
              <View style={styles.challengeBody}>
                <Text style={styles.challengeLabel}>Próximo logro</Text>
                <Text style={styles.challengeTitle}>{nextGoal.title}</Text>
                <Text style={styles.challengeText}>
                  {nextGoal.description} · {nextGoal.current}/{nextGoal.goal}
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${nextPercent}%` }]} />
                </View>
              </View>
              <Text style={styles.challengePoints}>+{nextGoal.points}</Text>
            </View>
          ) : (
            <View style={styles.challenge}>
              <Ionicons name="trophy" size={28} color={colors.rating} />
              <Text style={styles.challengeTitle}>¡Desbloqueaste todos los logros!</Text>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Insignias</Text>
            <Text style={styles.sectionMeta}>{unlockedCount} de {list.length} desbloqueadas</Text>
          </View>
          <View style={styles.badgeGrid}>
            {list.map((item) => (
              <Badge key={item.id} achievement={item} />
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Premios para canjear</Text>
            <Text style={styles.sectionMeta}>En cines adheridos</Text>
          </View>
          <FlatList
            horizontal
            data={REWARDS}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rewardList}
            renderItem={({ item }) => {
              const missing = item.cost - available;
              return (
                <View style={styles.rewardCard}>
                  <View style={styles.rewardIcon}>
                    <Ionicons name={item.icon as any} size={28} color={colors.rating} />
                  </View>
                  <View style={styles.rewardBody}>
                    <Text style={styles.rewardTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.rewardCost}>{item.cost} pts</Text>
                    {missing > 0 ? (
                      <View style={[styles.redeemButton, styles.redeemButtonDisabled]}>
                        <Text style={styles.redeemTextDisabled}>Te faltan {missing} pts</Text>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.redeemButton} onPress={() => handleRedeem(item)}>
                        <Text style={styles.redeemText}>Canjear</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
          />

          {rewards.redeemed.length > 0 && (
            <View style={styles.redeemed}>
              <Text style={styles.sectionTitle}>Mis canjes</Text>
              {rewards.redeemed.map((r) => (
                <Text key={r.code} style={styles.redeemedItem}>
                  {r.title} · código {r.code}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.title,
    marginLeft: 10,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.rating,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pointsText: {
    color: colors.rating,
    fontFamily: fonts.bodyBold,
    marginLeft: 6,
  },
  loader: {
    marginTop: 40,
  },
  challenge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  challengeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: colors.rating,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengePercent: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
  },
  challengeBody: {
    flex: 1,
    marginHorizontal: 14,
  },
  challengeLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  challengeTitle: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    marginTop: 2,
  },
  challengeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  challengePoints: {
    color: colors.rating,
    fontFamily: fonts.bodyBold,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceHigh,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.rating,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.bodyBold,
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.body,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  badge: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeLocked: {
    backgroundColor: colors.background,
    borderStyle: 'dashed',
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,193,7,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeIconLocked: {
    backgroundColor: colors.surfaceHigh,
  },
  badgeTitle: {
    color: colors.text,
    fontSize: 12,
    fontFamily: fonts.label,
    textAlign: 'center',
  },
  badgeMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  mutedText: {
    color: colors.textMuted,
  },
  rewardList: {
    paddingHorizontal: 16,
  },
  rewardCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardIcon: {
    height: 64,
    backgroundColor: colors.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardBody: {
    padding: 12,
  },
  rewardTitle: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
  },
  rewardCost: {
    color: colors.rating,
    fontFamily: fonts.bodyBold,
    marginTop: 2,
  },
  redeemButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.rating,
  },
  redeemButtonDisabled: {
    backgroundColor: colors.surfaceHigh,
  },
  redeemText: {
    color: colors.background,
    fontFamily: fonts.label,
  },
  redeemTextDisabled: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.label,
  },
  redeemed: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  redeemedItem: {
    color: colors.textMuted,
    marginTop: 6,
  },
  guest: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  guestTitle: {
    color: colors.text,
    fontSize: 20,
    fontFamily: fonts.title,
    marginTop: 16,
    textAlign: 'center',
  },
  guestText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.body,
    marginTop: 6,
    textAlign: 'center',
  },
  guestButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 20,
  },
  guestButtonText: {
    color: colors.onAccentPrimary,
    fontFamily: fonts.label,
  },
});

export default AchievementsScreen;
