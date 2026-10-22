import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

type AppIconProps = Omit<ComponentProps<typeof Ionicons>, 'color'> & {
  tone?: 'default' | 'movieRating';
};

export type AppIconName = AppIconProps['name'];

// El color vive acá para que ningún icono dependa del contexto que lo renderiza.
export default function AppIcon({ tone = 'default', ...props }: AppIconProps) {
  const color = tone === 'movieRating' ? colors.movieRating : colors.icon;
  return <Ionicons {...props} color={color} />;
}
