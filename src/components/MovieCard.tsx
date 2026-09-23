import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function MovieCard({ movie, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: movie.posterUrl }} style={styles.poster} />
      <Text style={styles.title} numberOfLines={2}>
        {movie.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '31%',
    marginBottom: 16,
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
  },
  title: {
    color: colors.text,
    fontSize: 12,
    marginTop: 6,
  },
});
