import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts } from '../theme';
import BrandLogo from './BrandLogo';

type GuestPromptProps = {
  title: string;
  description: string;
  onLogin: () => void;
};

export default function GuestPrompt({ title, description, onLogin }: GuestPromptProps) {
  return (
    <View style={styles.container}>
      <BrandLogo size={96} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TouchableOpacity style={styles.button} onPress={onLogin} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontFamily: fonts.title,
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.body,
    marginTop: 6,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 20,
  },
  buttonText: {
    color: colors.onAccentPrimary,
    fontFamily: fonts.label,
  },
});
