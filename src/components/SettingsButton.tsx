import { TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import AppIcon from './AppIcon';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

type SettingsButtonProps = {
  style?: StyleProp<ViewStyle>;
};

export default function SettingsButton({ style }: SettingsButtonProps) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      hitSlop={8}
      onPress={() => navigation.navigate(user.isLoggedIn ? 'Settings' : 'Login')}
    >
      <AppIcon name="settings-outline" size={20} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { marginLeft: 'auto', padding: 8 },
});
