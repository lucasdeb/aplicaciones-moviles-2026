import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { changePassword } from '../services/api';
import { isValidPassword, PASSWORD_HINT } from '../utils/validators';
import { colors, fonts } from '../theme';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function save() {
    if (busy) return;
    setError(''); setMessage('');
    if (!currentPassword) { setError('Ingresá tu contraseña actual'); return; }
    if (!isValidPassword(newPassword) || newPassword.length > 72) { setError(`${PASSWORD_HINT}. Máximo 72 caracteres.`); return; }
    if (newPassword === currentPassword) { setError('La nueva contraseña debe ser diferente de la actual'); return; }
    if (newPassword !== confirmation) { setError('Las contraseñas no coinciden'); return; }
    setBusy(true);
    try {
      const result = await changePassword({ currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmation('');
      setMessage(result.message);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Cambiar contraseña</Text>
        <Text style={styles.hint}>Ingresá tu contraseña actual y elegí una nueva. Se cerrarán las sesiones en los demás dispositivos; esta sesión seguirá activa.</Text>
        <Text style={styles.label}>Contraseña actual</Text>
        <TextInput style={styles.input} accessibilityLabel="Contraseña actual" secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="current-password" value={currentPassword} onChangeText={setCurrentPassword} editable={!busy} maxLength={72} />
        <Text style={styles.label}>Nueva contraseña</Text>
        <TextInput style={styles.input} accessibilityLabel="Nueva contraseña" secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" value={newPassword} onChangeText={setNewPassword} editable={!busy} maxLength={72} />
        <Text style={styles.hint}>{PASSWORD_HINT}. Máximo 72 caracteres.</Text>
        <Text style={styles.label}>Repetir nueva contraseña</Text>
        <TextInput style={styles.input} accessibilityLabel="Repetir nueva contraseña" secureTextEntry autoCapitalize="none" autoCorrect={false} value={confirmation} onChangeText={setConfirmation} editable={!busy} maxLength={72} />
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {!!message && <Text accessibilityLiveRegion="polite" style={styles.hint}>{message}</Text>}
        <TouchableOpacity style={[styles.button, busy && styles.disabled]} disabled={busy} onPress={save}>
          {busy ? <ActivityIndicator color={colors.onAccentPrimary} /> : <Text style={styles.buttonText}>Guardar contraseña</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 48 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 24, marginBottom: 16 },
  label: { color: colors.text, fontFamily: fonts.label, marginBottom: 8 },
  hint: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginBottom: 18 },
  input: { backgroundColor: colors.surface, color: colors.text, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 14 },
  error: { color: colors.danger, marginBottom: 16 },
  button: { backgroundColor: colors.accentPrimary, borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: colors.onAccentPrimary, fontFamily: fonts.label, fontSize: 16 },
  disabled: { opacity: 0.5 },
});
