import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

function AchievementsScreen({ navigation }) {
  const { achievements, user, fetchAchievements, rewards } = useApp();
  useEffect(() => {
    fetchAchievements(user.user.id);
  }, []);

  const unlockedCount = achievements.list.filter((a) => a.unlocked).length;
  const available = achievements.totalPoints - rewards.spentPoints;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Logros</Text>

      {achievements.isFetching ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accentPrimary} />
          <Text style={styles.loadingText}>Cargando logros...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>
            {unlockedCount} de {achievements.list.length} desbloqueados
          </Text>
          <TouchableOpacity style={styles.pointsBox} onPress={() => navigation.navigate('Rewards')} activeOpacity={0.8}>
            <Ionicons name="diamond-outline" size={18} color={colors.accentPrimary} />
            <Text style={styles.pointsText}>{available} puntos disponibles</Text>
            <Text style={styles.pointsLink}>Canjear ›</Text>
          </TouchableOpacity>

          <FlatList
            data={achievements.list}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            renderItem={({ item }) =>
              item.unlocked ? (
                <LinearGradient
                  colors={[colors.accentPrimary, colors.accentSecondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  <View style={styles.iconCircleUnlocked}>
                    <Ionicons name={item.icon} size={28} color={colors.accentPrimary} />
                  </View>
                  <Text style={styles.cardTitleUnlocked}>{item.title}</Text>
                  <Text style={styles.cardDescriptionUnlocked}>{item.description}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.card, styles.cardLocked]}>
                  <View style={styles.iconCircleLocked}>
                    <Ionicons name="lock-closed" size={22} color={colors.textMuted} />
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                  <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${(item.current / item.goal) * 100}%` as `${number}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{item.current}/{item.goal} · +{item.points} pts</Text>
                </View>
              )
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
  },

  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accentPrimary },
  progressText: { color: colors.textMuted, fontSize: 11, marginTop: 4 },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  centered: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 10,
  },
  pointsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  pointsText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 8,
  },
  pointsLink: {
    color: colors.accentPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    minHeight: 150,
  },
  cardLocked: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircleUnlocked: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircleLocked: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleUnlocked: {
    color: colors.onAccentPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardDescriptionUnlocked: {
    color: colors.onAccentPrimary,
    fontSize: 11,
    marginTop: 4,
    opacity: 0.85,
  },
  cardTitle: {
    color: colors.textMuted,
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardDescription: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
});

export default AchievementsScreen;
