import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { fonts } from '../theme';

const MAX_DURATION_MS = 12000;

type IntroVideoProps = {
  onFinish: () => void;
};

export default function IntroVideo({ onFinish }: IntroVideoProps) {
  const player = useVideoPlayer(require('../../assets/Carga.mp4'), (p) => {
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    const ended = player.addListener('playToEnd', onFinish);
    const status = player.addListener('statusChange', ({ status }) => {
      if (status === 'error') onFinish();
    });
    const fallback = setTimeout(onFinish, MAX_DURATION_MS);
    return () => {
      ended.remove();
      status.remove();
      clearTimeout(fallback);
    };
  }, [player, onFinish]);

  return (
    <View style={styles.container}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls={false} />
      <Pressable style={StyleSheet.absoluteFill} onPress={onFinish}>
        <Text style={styles.skip}>Tocá para saltear</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  skip: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: fonts.body,
  },
});
