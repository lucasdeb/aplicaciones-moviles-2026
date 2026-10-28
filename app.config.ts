import type { ConfigContext, ExpoConfig } from 'expo/config';
export default ({ config }: ConfigContext): ExpoConfig => {
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || config.extra?.eas?.projectId;
  return {
    ...config, name: config.name ?? 'WhatNext', slug: config.slug ?? 'mobile',
    ...(projectId ? { extra: { ...config.extra, eas: { ...config.extra?.eas, projectId } } } : {}),
    ios: { ...config.ios, ...(process.env.EXPO_PUBLIC_IOS_BUNDLE_ID ? { bundleIdentifier: process.env.EXPO_PUBLIC_IOS_BUNDLE_ID } : {}) },
    android: { ...config.android, ...(process.env.EXPO_PUBLIC_ANDROID_PACKAGE ? { package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE } : {}) },
  };
};
