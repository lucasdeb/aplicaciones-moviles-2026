import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Linking, ActivityIndicator, StyleSheet } from 'react-native';
import { request } from '../services/http';
import { colors, fonts } from '../theme';

type Provider = 'apple' | 'google';
export default function VoucherWalletActions({ redemptionId }: { redemptionId: number }) {
  const [availability, setAvailability] = useState<any>(null);
  const [busy, setBusy] = useState<Provider | null>(null), [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    request('/wallet/status').then(value => { if (active) setAvailability(value); }).catch(() => { if (active) setError('No se pudo consultar Wallet. Volvé a abrir esta pantalla para reintentar.'); });
    return () => { active = false; };
  }, []);
  async function add(provider: Provider) {
    setBusy(provider); setError('');
    try {
      const result = await request(`/rewards/redemptions/${redemptionId}/wallet`, 'POST', { provider });
      if (Platform.OS === 'web') window.location.assign(result.url);
      else await Linking.openURL(result.url);
    } catch (e) { setError(e.message); } finally { setBusy(null); }
  }
  const providers: Provider[] = Platform.OS === 'ios' ? ['apple'] : Platform.OS === 'android' ? ['google'] : ['apple', 'google'];
  return <View style={styles.container}>
    {!availability && !error ? <ActivityIndicator size="small" /> : null}
    {availability ? providers.map(provider => <View key={provider}>
      <TouchableOpacity accessibilityRole="button" disabled={!!busy || !availability[provider].available} style={[styles.button, !availability[provider].available && styles.disabled]} onPress={() => add(provider)}>
        <Text style={styles.label}>{busy === provider ? 'Preparando vale…' : `Agregar a ${provider === 'apple' ? 'Apple Wallet' : 'Google Wallet'}`}</Text>
      </TouchableOpacity>
      {!availability[provider].available ? <Text style={styles.note}>{availability[provider].reason}</Text> : null}
    </View>) : null}
    {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({ container: { marginTop: 8 }, button: { backgroundColor: '#000', borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 12, marginVertical: 4 }, disabled: { opacity: 0.5 }, label: { color: '#fff', fontFamily: fonts.label, textAlign: 'center' }, note: { color: colors.textMuted, fontSize: 12, marginTop: 4 }, error: { color: colors.danger, marginTop: 8 } });
