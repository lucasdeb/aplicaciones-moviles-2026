import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { useAuth } from '../context/AuthContext';
import { ensureNotificationPermission } from '../utils/reminders';
import { isValidEmail } from '../utils/validators';
import { colors, fonts } from '../theme';

function SettingsScreen() {
  const { user, updateUser, logOut } = useAuth();
  const [name, setName] = useState(user.user?.name ?? '');
  const [email, setEmail] = useState(user.user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [notificationsOn, setNotificationsOn] = useState(false);

  // El permiso se puede cambiar desde los ajustes del teléfono,
  // así que lo volvemos a leer cada vez que la app vuelve al frente
  useEffect(() => {
    if (Platform.OS === 'web') return;
    function readPermission() {
      getPermissionsAsync()
        .then((status) => setNotificationsOn(status.granted))
        .catch(() => setNotificationsOn(false));
    }
    readPermission();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') readPermission();
    });
    return () => subscription.remove();
  }, []);

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

  async function onToggleNotifications(value: boolean) {
    if (Platform.OS === 'web') {
      Alert.alert('No disponible', 'Los avisos funcionan solo en el celular.');
      return;
    }
    // Una app no puede quitarse el permiso sola: para apagarlo hay que ir a los ajustes
    if (!value) {
      Alert.alert('Desactivar avisos', 'Podés desactivar las notificaciones desde los ajustes del teléfono.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    try {
      const { granted, canAskAgain } = await ensureNotificationPermission();
      setNotificationsOn(granted);
      if (!granted && !canAskAgain) {
        Alert.alert('Notificaciones bloqueadas', 'Activalas en los ajustes del teléfono para recibir avisos.', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo pedir el permiso: ' + error.message);
    }
  }

  function onLogOut() {
    Alert.alert('Cerrar sesión', '¿Seguro que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      // Al salir, el Navigator quita esta pantalla solo (está dentro del bloque isLoggedIn)
      { text: 'Salir', style: 'destructive', onPress: logOut },
    ]);
  }

  return (
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

      <Text style={styles.sectionTitle}>Preferencias</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="notifications-outline" size={20} color={colors.accentPrimarySoft} />
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Avisos de estrenos</Text>
            <Text style={styles.rowSubtitle}>Te avisamos el día que se estrena una película</Text>
          </View>
          <Switch
            value={notificationsOn}
            onValueChange={onToggleNotifications}
            trackColor={{ false: colors.surfaceHigh, true: colors.accentPrimary }}
            thumbColor={colors.onAccentPrimary}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logout} onPress={onLogOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    marginHorizontal: 12,
  },
  rowTitle: {
    color: colors.text,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  rowSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2,
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
