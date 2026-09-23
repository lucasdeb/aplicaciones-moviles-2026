import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function StarRating({ rating, size = 13 }) {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    let name = 'star-outline';
    if (rating >= i) name = 'star';
    else if (rating >= i - 0.5) name = 'star-half';
    stars.push(name);
  }

  return (
    <View style={styles.row}>
      {stars.map((name, index) => (
        <Ionicons
          key={index}
          name={name}
          size={size}
          color={colors.accentSecondary}
          style={styles.star}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 1,
  },
});
