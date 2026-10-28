import { useState } from 'react';
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
import AppIcon from '../components/AppIcon';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { useOnFocus } from '../hooks/useOnFocus';

import { colors, fonts } from '../theme';
import BrandLogo from '../components/BrandLogo';
import SettingsButton from '../components/SettingsButton';
import ConfirmModal from '../components/ConfirmModal';
import VoucherWalletActions from '../components/VoucherWalletActions';
import GuestPrompt from '../components/GuestPrompt';

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

type Reward = { id: string; title: string; description: string; icon: any; cost: number };

type BadgeProps = {
  achievement: Achievement;
};

function Badge({ achievement }: BadgeProps) {
  if (!achievement.unlocked) {
    return (
      <View style={[styles.badge, styles.badgeLocked]}>
        <View style={[styles.badgeIcon, styles.badgeIconLocked]}>
          <AppIcon name="lock-closed" size={18} />
        </View>
        <Text style={[styles.badgeTitle, styles.mutedText]} numberOfLines={2}>{achievement.title}</Text>
        <Text style={styles.badgeMeta}>{achievement.current}/{achievement.goal}</Text>
      </View>
    );
  }

  return (
    <View style={styles.badge}>
      <View style={styles.badgeIcon}>
        <AppIcon name={achievement.icon as any} size={20} />
      </View>
      <Text style={styles.badgeTitle} numberOfLines={2}>{achievement.title}</Text>
      <Text style={styles.badgeMeta}>+{achievement.points} pts</Text>
    </View>
  );
}

function AchievementsScreen({ navigation }) {
  const { user } = useAuth();
  const { achievements, rewards, points, fetchMorePoints, fetchAchievements, redeemReward, cancelRedemption } = useGamification();
  const [cancelTarget, setCancelTarget] = useState<{ id: number; title: string; cost: number } | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [historyBusy, setHistoryBusy] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [rewardToRedeem, setRewardToRedeem] = useState<Reward | null>(null);

  // Se recalcula al entrar a la solapa, así refleja las reseñas nuevas
  useOnFocus(fetchAchievements, [user.user?.id]);

  if (!user.isLoggedIn) {
    return (
      <GuestPrompt
        title="Ganá puntos con tus reseñas"
        description="Iniciá sesión para ver tus logros y canjear premios en cines adheridos."
        onLogin={() => navigation.navigate('Login')}
      />
    );
  }

  const list: Achievement[] = achievements.list;
  const available = rewards.availablePoints;
  const unlockedCount = list.filter((a) => a.unlocked).length;
  const nextGoal = list
    .filter((a) => !a.unlocked)
    .sort((a, b) => b.current / b.goal - a.current / a.goal)[0];
  const nextPercent = nextGoal ? Math.round((nextGoal.current / nextGoal.goal) * 100) : 100;

  function handleRedeem(reward: Reward) {
    setRewardToRedeem(reward);
  }

  async function confirmRedeem() {
    if (!rewardToRedeem || redeeming) return;
    setRedeeming(true);

    const result = await redeemReward(rewardToRedeem);
    setRedeeming(false);

    if (!result.success) {
      Alert.alert('No se pudo canjear', result.error);
      return;
    }

    setRewardToRedeem(null);
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {achievements.error ? <Text style={{ color: colors.danger }} accessibilityRole="alert">{achievements.error}</Text> : null}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <BrandLogo size={36} />
            <Text style={styles.headerTitle}>Logros</Text>
            <SettingsButton />
          </View>
          <View style={styles.pointsPill}>
            <AppIcon name="diamond-outline" size={14} />
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
                <AppIcon name="trophy" size={28} />
                <Text style={styles.challengeTitle}>¡Desbloqueaste todos los logros!</Text>
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Todos los Logros</Text>
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
              data={rewards.catalog}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rewardList}
              renderItem={({ item }) => {
                const missing = item.cost - available;
                return (
                  <View style={styles.rewardCard}>
                    <View style={styles.rewardIcon}>
                      <AppIcon name={item.icon as any} size={28} />
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
                  <View key={r.code} style={{ marginTop: 12 }}>
                    <Text style={styles.redeemedItem}>
                      {r.title} · código {r.code} · {({ active: 'Disponible', used: 'Usado', expired: 'Vencido', refunded: 'Reintegrado' })[r.status] ?? r.status}
                    </Text>
                    {r.status === 'active' ? <VoucherWalletActions redemptionId={r.id} /> : null}
                    {['active', 'expired'].includes(r.status) ? <TouchableOpacity accessibilityRole="button" disabled={canceling} style={styles.cancelVoucher} onPress={() => { setCancelError(''); setCancelTarget({ id: r.id, title: r.title, cost: r.cost }); }}>
                      <Text style={styles.cancelVoucherText}>Anular canje y recuperar puntos</Text>
                    </TouchableOpacity> : null}
                  </View>
                ))}
              </View>
            )}
            <View style={styles.redeemed}>
              <Text style={styles.sectionTitle}>Historial de puntos</Text>
              <Text style={styles.sectionMeta}>Los puntos de un logro se acreditan una sola vez y se conservan.</Text>
              {points.entries.length ? points.entries.map(entry => <View key={entry.id} style={{ marginTop: 12 }}>
                <Text style={styles.redeemedItem}>{entry.amount > 0 ? '+' : ''}{entry.amount} pts · {entry.description}</Text>
                <Text style={styles.sectionMeta}>{new Date(entry.createdAt).toLocaleDateString()}</Text>
              </View>) : <Text style={styles.redeemedItem}>Todavía no tenés movimientos.</Text>}
              {historyError ? <Text style={{ color: colors.danger }}>{historyError}</Text> : null}
              {points.nextCursor ? <TouchableOpacity disabled={historyBusy} onPress={async () => { setHistoryBusy(true); setHistoryError(''); try { await fetchMorePoints(); } catch (e) { setHistoryError(e.message); } finally { setHistoryBusy(false); } }}><Text style={styles.redeemedItem}>{historyBusy ? 'Cargando…' : 'Ver más movimientos'}</Text></TouchableOpacity> : null}
            </View>

          </>
        )}
      </ScrollView>
      <ConfirmModal
        visible={cancelTarget !== null}
        title="Anular canje"
        message={cancelError || `¿Anular "${cancelTarget?.title}"? El código dejará de ser válido y se devolverán ${cancelTarget?.cost} puntos si el premio no fue utilizado.`}
        confirmLabel="Anular y recuperar puntos"
        loading={canceling}
        onConfirm={async () => {
          if (!cancelTarget || canceling) return;
          setCanceling(true); setCancelError('');
          const result = await cancelRedemption(cancelTarget.id);
          setCanceling(false);
          if (result.success) setCancelTarget(null);
          else { setCancelError(result.error || 'No se pudo anular el canje'); void fetchAchievements(); }
        }}
        onCancel={() => { if (!canceling) { setCancelTarget(null); setCancelError(''); } }}
      />
      <ConfirmModal
        visible={rewardToRedeem !== null}
        title="Canjear premio"
        message={`¿Canjear "${rewardToRedeem?.title}" por ${rewardToRedeem?.cost} puntos?`}
        confirmLabel="Canjear"
        loading={redeeming}
        onConfirm={confirmRedeem}
        onCancel={() => { if (!redeeming) setRewardToRedeem(null); }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  cancelVoucher: { marginTop: 10, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  cancelVoucherText: { color: colors.text, fontFamily: fonts.label, textAlign: 'center' },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
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
    alignSelf: 'flex-start',
  marginTop: 12,
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
    backgroundColor: 'rgba(229,9,20,0.15)',
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
});

export default AchievementsScreen;
