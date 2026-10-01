import React from 'react';
import { Image, StyleSheet } from 'react-native';

type BrandLogoProps = {
  size?: number;
};

export default function BrandLogo({ size = 40 }: BrandLogoProps) {
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={[styles.logo, { width: size, height: size }]}
      resizeMode="contain"
      accessibilityLabel="WhatNext"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});
