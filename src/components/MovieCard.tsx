import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import AppIcon from './AppIcon';
import { colors, fonts } from '../theme';
import { formatRating, getMovieYear, getPrimaryGenre } from '../utils/movieMetadata';

type MovieCardProps = {
  movie: any;
  onPress: () => void;
  reviewCount?: number;
  style?: StyleProp<ViewStyle>;
};

export default function MovieCard({ movie, onPress, reviewCount, style }: MovieCardProps) {
  const displayedReviewCount = reviewCount ?? movie.commentsCount ?? 0;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View>
        <Image source={{ uri: movie.posterUrl }} style={styles.poster} />
        <View style={styles.ratingBadge}>
          <AppIcon name="star" size={10} tone="movieRating" />
          <Text style={styles.ratingBadgeText}>{formatRating(movie.communityRating)}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {movie.title}
      </Text>
      <View style={styles.subtitleRow}>
        <Text style={styles.genre} numberOfLines={1}>
          {getPrimaryGenre(movie)}
        </Text>
        <Text style={styles.year}> · {getMovieYear(movie)}</Text>
      </View>
      <View style={styles.statsRow}>
        <AppIcon name="chatbubble-outline" size={12} />
        <Text style={styles.statText}>{displayedReviewCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
  },
  ratingBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.movieRating,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  ratingBadgeText: {
    color: colors.movieRating,
    fontSize: 10,
    fontFamily: fonts.label,
    marginLeft: 3,
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bodyBold,
    marginTop: 8,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  genre: {
    flexShrink: 1,
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
  },
  year: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statText: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
    marginLeft: 3,
  },
});
