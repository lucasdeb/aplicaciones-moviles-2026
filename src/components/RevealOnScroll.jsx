import React, { useState } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function RevealOnScroll({ children, scrollY, style }) {
  const [sectionY, setSectionY] = useState(null);

  function handleLayout(event) {
    if (sectionY === null) {
      setSectionY(event.nativeEvent.layout.y);
    }
  }

  if (sectionY === null) {
    return (
      <Animated.View onLayout={handleLayout} style={style}>
        {children}
      </Animated.View>
    );
  }

  const inputRange = [sectionY - SCREEN_HEIGHT * 0.85, sectionY - SCREEN_HEIGHT * 0.6];

  const opacity = scrollY.interpolate({
    inputRange,
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const translateY = scrollY.interpolate({
    inputRange,
    outputRange: [32, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View onLayout={handleLayout} style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
