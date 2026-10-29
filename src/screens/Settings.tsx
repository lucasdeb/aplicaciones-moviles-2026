import { notificationPermissionHint, notificationTestError } from '../utils/notificationFeedback';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import AppIcon from '../components/AppIcon';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/validators';
import { colors, fonts } from '../theme';
import { registerDevicePush, pushUnavailableReason } from '../services/push';
import { request } from '../services/http';
import ConfirmModal from '../components/ConfirmModal';

function SettingsScreen({ navigation }) {
  const { user, updateUser, logOut } = useAuth();
  const [name, setName] = useState(user.user?.name ?? '');
  const [email, setEmail] = useState(user.user?.email ?? '');
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMessage, setPushMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [logoutVisible, setLogoutVisible] = useState(false);

  const hasChanges = name.trim() !== user.user?.name || email.trim() !== user.user?.email;

  async function onSave() {
    if (!name.trim()) return setFormError('El nombre no puede estar vacío');
    if (!isValidEmail(email)) return setFormError('Ingresá un email válido');
    setFormError('');
    setSaving(true);
    const result = await updateUser({ name: name.trim(), email: email.trim() });
    setSaving(false);
    if (result.success) Alert.alert('¡Listo!', 'Tus datos se actualizaron.');
    else setFormError(result.error ?? 'No se pudieron guardar los cambios');
  }

  function onLogOut() {
    setLogoutVisible(true);
  }

  async function confirmLogOut(){
    setLogoutVisible(false);
    try { await logOut(); }
    catch (e) { Alert.alert('No se pudo cerrar la sesión', e.message); }
  }
  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {formError ? <Text style={styles.error}>{formError}</Text> : null}

          <TouchableOpacity
            style={[styles.button, (!hasChanges || saving) && styles.buttonDisabled]}
            onPress={onSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.onAccentPrimary} />
            ) : (
              <Text style={styles.buttonText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Seguridad</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChangePassword')}>
            <Text style={styles.buttonText}>Cambiar contraseña</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{pushUnavailableReason() || 'Activá y probá las notificaciones de este teléfono.'}</Text>
          <TouchableOpacity style={[styles.button, pushBusy && styles.buttonDisabled]} disabled={pushBusy} onPress={async () => {
            setPushBusy(true); setPushMessage('');
            try {
              const reason = pushUnavailableReason();
              if (reason) { setPushMessage(reason); return; }
              if (!await registerDevicePush(true)) { setPushMessage(notificationPermissionHint); return; }
              await request('/push/test', 'POST'); setPushMessage('Prueba enviada. Revisá las notificaciones de tu teléfono.');
            } catch (e) { setPushMessage(notificationTestError(e)); } finally { setPushBusy(false); }
          }}><Text style={styles.buttonText}>{pushBusy ? 'Enviando prueba…' : 'Probar notificaciones'}</Text></TouchableOpacity>
          {pushMessage ? <Text style={[styles.label, { marginTop: 12 }]}>{pushMessage}</Text> : null}
        </View>
        {['moderator', 'superadmin'].includes(user.user?.role ?? '') ? <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ManageRedemptions')}><Text style={styles.buttonText}>Validar canjes</Text></TouchableOpacity> : null}
        <TouchableOpacity style={styles.logout} onPress={onLogOut}>
          <AppIcon name="log-out-outline" size={20} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmModal
        visible={logoutVisible}
        title="Cerrar sesión"
        message="¿Seguro que querés salir de tu cuenta?"
        confirmLabel="Salir"
        destructive
        onConfirm={confirmLogOut}
        onCancel={() => setLogoutVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.title,
    marginTop: 8,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: fonts.label,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    fontFamily: fonts.body,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.body,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.onAccentPrimary,
    fontFamily: fonts.label,
    fontSize: 16,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {
    color: colors.danger,
    fontFamily: fonts.label,
    fontSize: 16,
    marginLeft: 8,
  },
});

export default SettingsScreen;
