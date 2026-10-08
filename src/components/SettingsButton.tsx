import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function SettingsButton() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  return (
    <TouchableOpacity
      style={styles.button}
      hitSlop={8}
      onPress={() => navigation.navigate(user.isLoggedIn ? 'Settings' : 'Login')}
    >
      <Ionicons name="settings-outline" size={20} color={colors.accentPrimarySoft} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { marginLeft: 'auto', padding: 8 },
});