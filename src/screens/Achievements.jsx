import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { connectScreen } from '../redux/helpers';
import { colors } from '../theme';

function AchievementsScreen({ achievements, user, fetchAchievements }) {
  useEffect(() => {
    fetchAchievements(user.user.id);
  }, []);

  const unlockedCount = achievements.list.filter((a) => a.unlocked).length;

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

function mapStateToProps(state) {
  return { achievements: state.achievements, user: state.users };
}

export default connectScreen(AchievementsScreen, mapStateToProps);
