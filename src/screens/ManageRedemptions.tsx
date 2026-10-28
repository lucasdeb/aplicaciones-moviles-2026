import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import ConfirmModal from '../components/ConfirmModal';
import { request } from '../services/http';
import { useAuth } from '../context/AuthContext';
import { colors, fonts } from '../theme';
export default function ManageRedemptionsScreen() {
  const { user } = useAuth();
  const [action, setAction] = useState<'use' | 'refund' | null>(null);
  const [code, setCode] = useState(''), [result, setResult] = useState<any>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  async function run(action: 'validate' | 'use' | 'refund') {
    setBusy(true); setError('');
    try {
      if (action === 'refund') {
        await request(`/admin/redemptions/${result.id}/refund`, 'POST');
        setResult(await request('/admin/redemptions/validate', 'POST', { code: code.trim().toUpperCase() }));
      } else setResult(await request(`/admin/redemptions/${action}`, 'POST', { code: code.trim().toUpperCase() }));
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <><ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Validar canje</Text>
    <TextInput style={styles.input} placeholder="Código de 16 caracteres" placeholderTextColor={colors.textMuted} autoCapitalize="characters" editable={!busy} value={code} maxLength={16} onChangeText={value => { setCode(value); setResult(null); }} />
    <TouchableOpacity style={styles.button} disabled={busy} onPress={() => run('validate')}><Text style={styles.buttonText}>Consultar código</Text></TouchableOpacity>
    {busy ? <ActivityIndicator /> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {result ? <>
      <Text style={styles.text}>{result.reward?.title} · {result.user.name}</Text>
      <Text style={styles.text}>Estado: {({ active: 'Disponible', used: 'Usado', expired: 'Vencido', refunded: 'Reintegrado', canceled: 'Anulado' })[result.status]}</Text>
      <Text style={styles.text}>Vence: {new Date(result.expiresAt).toLocaleDateString()}</Text>
      {result.status === 'active' ? <TouchableOpacity style={styles.button} disabled={busy} onPress={() => setAction('use')}><Text style={styles.buttonText}>Confirmar entrega del premio</Text></TouchableOpacity> : null}
      {['active', 'expired'].includes(result.status) && user.user?.role === 'superadmin' ? <TouchableOpacity style={styles.button} disabled={busy} onPress={() => setAction('refund')}><Text style={styles.buttonText}>Anular y reintegrar puntos</Text></TouchableOpacity> : null}
    </> : null}
  </ScrollView><ConfirmModal visible={action !== null} title={action === 'use' ? 'Confirmar entrega' : 'Reintegrar puntos'} message={action === 'use' ? 'El código quedará usado. ¿Ya entregaste el premio?' : 'El código se anulará y se devolverán los puntos.'} confirmLabel="Confirmar" loading={busy} onConfirm={async () => { if (action) { await run(action); setAction(null); } }} onCancel={() => { if (!busy) setAction(null); }} /></>;
}
const styles = StyleSheet.create({ container: { flexGrow: 1, padding: 24, backgroundColor: colors.background }, title: { color: colors.text, fontFamily: fonts.title, fontSize: 24, marginBottom: 20 }, input: { backgroundColor: colors.surface, color: colors.text, padding: 14, borderRadius: 8, marginBottom: 16 }, button: { padding: 16, marginVertical: 8, borderRadius: 8, backgroundColor: colors.accentPrimary }, buttonText: { color: colors.onAccentPrimary, fontFamily: fonts.label, textAlign: 'center' }, text: { color: colors.text, marginVertical: 10 }, error: { color: colors.danger, marginVertical: 10 } });
