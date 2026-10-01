import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { REWARDS } from '../mockData';
import { colors, fonts } from '../theme';

function RewardsScreen() {
  const { achievements, rewards, redeemReward } = useApp();
  const available = achievements.totalPoints - rewards.spentPoints;

  function handleRedeem(reward) {
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
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Premios</Text>
      <Text style={styles.subtitle}>Tenés {available} puntos disponibles</Text>

      <FlatList
        data={REWARDS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const canAfford = available >= item.cost;
          return (
            <View style={styles.card}>
              <Ionicons name={item.icon as any} size={26} color={colors.accentPrimary} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
              <TouchableOpacity
                style={[styles.redeemButton, !canAfford && styles.redeemButtonDisabled]}
                disabled={!canAfford}
                onPress={() => handleRedeem(item)}
              >
                <Text style={styles.redeemText}>{item.cost} pts</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListFooterComponent={
          rewards.redeemed.length > 0 ? (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.sectionTitle}>Mis canjes</Text>
              {rewards.redeemed.map((r) => (
                <Text key={r.code} style={styles.redeemedItem}>
                  {r.title} · código {r.code}
                </Text>
              ))}
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 16 },
  headerTitle: { color: colors.text, fontSize: 20, fontFamily: fonts.title, paddingHorizontal: 16 },
  subtitle: { color: colors.textMuted, fontSize: 13, fontFamily: fonts.body, paddingHorizontal: 16, marginTop: 4, marginBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, marginBottom: 10 },
  cardBody: { flex: 1, marginHorizontal: 12 },
  cardTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 14 },
  cardDescription: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.body, marginTop: 2 },
  redeemButton: { backgroundColor: colors.accentPrimary, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  redeemButtonDisabled: { backgroundColor: colors.surfaceAlt },
  redeemText: { color: colors.onAccentPrimary, fontFamily: fonts.label, fontSize: 12 },
  sectionTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 16, marginBottom: 8 },
  redeemedItem: { color: colors.textMuted, fontSize: 13, fontFamily: fonts.body, marginBottom: 4 },
});

export default RewardsScreen;