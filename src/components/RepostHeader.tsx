import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppIcon from './AppIcon';
import { colors, fonts } from '../theme';

export default function RepostHeader({ name, onPress }) {
  return (
    <View style={styles.container}>
      <AppIcon name="repeat" size={14} />
      <TouchableOpacity style={styles.label} onPress={onPress}>
        <Text style={styles.text}>Reposteado por {name ?? 'Usuario'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  label: { flex: 1 },
  text: { color: colors.accentSecondaryText, fontFamily: fonts.body, fontSize: 12 },
});
