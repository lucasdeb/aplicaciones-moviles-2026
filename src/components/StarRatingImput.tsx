import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

type Props = {
  value: number | null;              
  onChange: (value: number) => void;
  size?: number;
};

export default function StarRatingInput({ value, onChange, size = 26 }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(value === n ? n - 1 : n)} hitSlop={4}>
          <Ionicons
            name={value !== null && value >= n ? 'star' : 'star-outline'}
            size={size}
            color={colors.rating}
          />
        </TouchableOpacity>
      ))}
      <Text style={styles.label}>{value === null ? 'Puntuá la película' : `${value} de 5`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  label: { color: colors.textMuted, fontFamily: fonts.label, fontSize: 13, marginLeft: 6 },
});
