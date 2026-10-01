import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/Navigator';
import IntroVideo from './src/components/IntroVideo';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        {showIntro ? <IntroVideo onFinish={() => setShowIntro(false)} /> : <RootNavigator />}
      </AppProvider>
    </SafeAreaProvider>
  );
}
