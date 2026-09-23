import React, { useState } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// Envuelve una sección para que aparezca (fade + un empujoncito hacia
// arriba) recién cuando el scroll la va acercando a la pantalla, en vez de
// estar visible desde que carga el Home. Usa la misma API (Animated.Value
// + interpolate) que el carrusel de la iteración 6, no una librería nueva.
//
// Cómo funciona: `scrollY` es el valor animado que va guardando cuánto
// scrolleó el ScrollView del Home (se arma ahí, esto solo lo consume).
// Con onLayout medimos en qué "y" del contenido cae esta sección, y con
// eso armamos el rango de scroll donde tiene que ir apareciendo.
export default function RevealOnScroll({ children, scrollY, style }) {
  const [sectionY, setSectionY] = useState(null);

  function handleLayout(event) {
    // Solo la primera vez: si se remide (ej. cambia el contenido) no hace
    // falta recalcular, el rango ya quedó bien la primera vez.
    if (sectionY === null) {
      setSectionY(event.nativeEvent.layout.y);
    }
  }

  // Todavía no sabemos dónde cae la sección (primer render) — la mostramos
  // directamente para no dejarla invisible para siempre si el layout tarda.
  if (sectionY === null) {
    return (
      <Animated.View onLayout={handleLayout} style={style}>
        {children}
      </Animated.View>
    );
  }

  // Empieza a aparecer cuando le falta ~85% de la pantalla para entrar en
  // vista, y termina de aparecer del todo a los ~60% — así ya está visible
  // antes de que el usuario llegue del todo, no aparece de golpe.
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
