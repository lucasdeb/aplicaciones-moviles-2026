import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { MoviesProvider } from './src/context/MovieContext';
import { GamificationProvider } from './src/context/GamificationContext';
import RootNavigator from './src/Navigator';
import IntroVideo from './src/components/IntroVideo';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { useFonts } from 'expo-font';
import { BeVietnamPro_400Regular } from '@expo-google-fonts/be-vietnam-pro/400Regular';
import { BeVietnamPro_600SemiBold } from '@expo-google-fonts/be-vietnam-pro/600SemiBold';
import { BeVietnamPro_700Bold } from '@expo-google-fonts/be-vietnam-pro/700Bold';


export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [fontsLoaded, fontError] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
  });
  // Si las fuentes fallan, la app sigue con las del sistema
  const fontsReady = fontsLoaded || Boolean(fontError);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GamificationProvider>
          <MoviesProvider>
            <StatusBar style="light" />
              {showIntro || !fontsReady ? <IntroVideo onFinish={() => setShowIntro(false)} /> : <RootNavigator />}
          </MoviesProvider>
        </GamificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
