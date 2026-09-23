import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { connectScreen } from '../redux/helpers';
import { colors } from '../theme';
import { isValidEmail, isValidPassword, PASSWORD_HINT } from '../utils/validators';

function RegisterScreen({ navigation, user, handleRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  function onSubmit() {
    if (!name.trim()) {
      setFormError('Ingresá tu nombre');
      return;
    }
    if (!isValidEmail(email)) {
      setFormError('Ingresá un email válido');
      return;
    }
    if (!isValidPassword(password)) {
      setFormError(PASSWORD_HINT);
      return;
    }
    setFormError('');
    handleRegister({ name: name.trim(), email: email.trim(), password });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.logo}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Sumate para armar tu diario de películas</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>{PASSWORD_HINT}</Text>

      {formError ? <Text style={styles.error}>{formError}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={user.isFetching}>
        {user.isFetching ? (
          <ActivityIndicator color={colors.onAccentPrimary} />
        ) : (
          <Text style={styles.buttonText}>Registrarme</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Ya tengo cuenta, iniciar sesión</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    color: colors.accentPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordWrapper: {
    justifyContent: 'center',
  },
  passwordInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingRight: 44,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 12,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 12,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.onAccentPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: colors.accentSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});

function mapStateToProps(state) {
  return { user: state.users };
}

export default connectScreen(RegisterScreen, mapStateToProps);
