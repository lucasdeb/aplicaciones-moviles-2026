import type { PushDestination } from './utils/pushDestination';
import { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AppIcon from './components/AppIcon';
import { useAuth } from './context/AuthContext';
import { listenToPushTaps } from './services/push';
import ManageRedemptionsScreen from './screens/ManageRedemptions';
import LoginScreen from './screens/Login';
import RegisterScreen from './screens/Register';
import ChangePasswordScreen from './screens/ChangePassword';
import HomeScreen from './screens/Home';
import MovieDetailScreen from './screens/MovieDetail';
import ProfileScreen from './screens/Profile';
import ManageMoviesScreen from './screens/ManageMovies';
import AddMovieScreen from './screens/AddMovie';
import ManageUsersScreen from './screens/ManageUsers';
import AchievementsScreen from './screens/Achievements';
import ReleasesScreen from './screens/Releases';
import { colors, fonts } from './theme';
import CinemasScreen from './screens/Cinemas';
import BrandLogo from './components/BrandLogo';
import SettingsScreen from './screens/Settings';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { user } = useAuth();
  return (
    <Tab.Navigator id="main-tabs"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fonts.label },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Populares', tabBarIcon: ({ size, focused }) => (<AppIcon name={focused ? 'flame' : 'flame-outline'} size={size} />) }} />
      {user.isLoggedIn && (<Tab.Screen name="Cinemas" component={CinemasScreen} options={{ tabBarLabel: 'Cines', tabBarIcon: ({ size, focused }) => (<AppIcon name={focused ? 'map' : 'map-outline'} size={size} />) }} />)}
      <Tab.Screen name="Releases" component={ReleasesScreen} options={{ tabBarLabel: 'Estrenos', tabBarIcon: ({ size, focused }) => (<AppIcon name={focused ? 'calendar' : 'calendar-outline'} size={size} />) }} />
      <Tab.Screen name="Logros" component={AchievementsScreen} options={{ tabBarLabel: 'Logros', tabBarIcon: ({ size, focused }) => (<AppIcon name={focused ? 'trophy' : 'trophy-outline'} size={size} />) }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ size, focused }) => (<AppIcon name={focused ? 'person-circle' : 'person-circle-outline'} size={size} />) }} />
    </Tab.Navigator>
  );
}

const headerOptions = {
  headerShown: true,
  title: '',
  headerTitle: () => <BrandLogo size={32} />,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
};

function RootNavigator() {
  const navigationRef = useNavigationContainerRef<any>();
  const pendingPush = useRef<PushDestination | null>(null);
  const openPush = (destination: PushDestination) => {
    if (navigationRef.isReady()) navigationRef.navigate(destination.screen, destination.params);
    else pendingPush.current = destination;
  };
  useEffect(() => {
    let stopped = false, unsubscribe: (() => void) | undefined;
    void listenToPushTaps(openPush).then(cleanup => { if (stopped) cleanup(); else unsubscribe = cleanup; }).catch(() => {});
    return () => { stopped = true; unsubscribe?.(); };
  }, []);
  const { user } = useAuth();
  return (
    <NavigationContainer ref={navigationRef} onReady={() => { if (pendingPush.current) { openPush(pendingPush.current); pendingPush.current = null; } }}>
      <Stack.Navigator id="root-stack" screenOptions={{ headerShown: false }}>
      {/* Visibles para todos */}
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen
       name="UserProfile"
        component={ProfileScreen}                              
        options={{ ...headerOptions, headerTitle: 'Perfil' }}  // ← header con flecha "atrás"
      />

      {user.isLoggedIn ? (
        <>
          {user.user?.role === 'superadmin' && (
            <>
              <Stack.Screen name="ManageMovies" component={ManageMoviesScreen} options={headerOptions} />
              <Stack.Screen name="AddMovie" component={AddMovieScreen} options={headerOptions} />
              <Stack.Screen name="ManageUsers" component={ManageUsersScreen} options={headerOptions} />
            </>
          )}
          {['moderator', 'superadmin'].includes(user.user?.role ?? '') && <Stack.Screen name="ManageRedemptions" component={ManageRedemptionsScreen} options={headerOptions} />}
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ ...headerOptions, headerTitle: 'Contraseña' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ ...headerOptions, headerTitle: 'Configuración' }} />
        </>
      ) : (
        <Stack.Group
          screenOptions={({ navigation }) => ({
            presentation: 'modal',
            headerShown: true,
            headerTransparent: true,
            title: '',
            // Flecha para volver a la pantalla anterior (en Android y web el modal no tiene otra salida)
            // Mismo botón redondo que el de MovieDetail
            headerLeft: () => (
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={8}>
                <AppIcon name="arrow-back" size={20} />
              </TouchableOpacity>
            ),
          })}
        >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;
