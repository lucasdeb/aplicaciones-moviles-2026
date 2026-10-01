import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from './context/AppContext';
import LoginScreen from './screens/Login';
import RegisterScreen from './screens/Register';
import HomeScreen from './screens/Home';
import MovieDetailScreen from './screens/MovieDetail';
import ProfileScreen from './screens/Profile';
import ManageMoviesScreen from './screens/ManageMovies';
import AddMovieScreen from './screens/AddMovie';
import ManageUsersScreen from './screens/ManageUsers';
import AchievementsScreen from './screens/Achievements';
import RewardsScreen from './screens/Rewards';
import ReleasesScreen from './screens/Releases';
import { colors, fonts } from './theme';
import CinemasScreen from './screens/Cinemas';
import BrandLogo from './components/BrandLogo';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { user } = useApp();
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Populares', tabBarIcon: ({color, size, focused})=>(<Ionicons name={focused ? 'flame': 'flame-outline'} size={size} color={color} />) }} />
      {user.isLoggedIn && (<Tab.Screen name="Cinemas" component={CinemasScreen} options={{ tabBarLabel: 'Cines' , tabBarIcon: ({color, size, focused})=>(<Ionicons name={focused ? 'map': 'map-outline'} size={size} color={color} />) }} />)}
      <Tab.Screen name="Releases" component={ReleasesScreen} options={{ tabBarLabel: 'Estrenos' , tabBarIcon: ({color, size, focused})=>(<Ionicons name={focused ? 'calendar': 'calendar-outline'} size={size} color={color} />) }} />
      <Tab.Screen name="Logros" component={AchievementsScreen} options={{ tabBarLabel: 'Logros', tabBarIcon: ({color, size, focused})=>(<Ionicons name={focused ? 'trophy': 'trophy-outline'} size={size} color={color} />) }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil', tabBarIcon: ({color, size, focused})=>(<Ionicons name={focused ? 'person-circle': 'person-circle-outline'} size={size} color={color} />) }} />
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
  const { user } = useApp();
  return (
    <NavigationContainer>
      <Stack.Navigator id="root-stack" screenOptions={{ headerShown: false }}>
      {/* Visibles para todos */}
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />

      {user.isLoggedIn ? (
        <>
        <Stack.Screen name="ManageMovies" component={ManageMoviesScreen} options={headerOptions} />
        <Stack.Screen name="AddMovie" component={AddMovieScreen} options={headerOptions} />
        <Stack.Screen name="ManageUsers" component={ManageUsersScreen} options={headerOptions} />
        <Stack.Screen name="Rewards" component={RewardsScreen} options={headerOptions} />
        </>
      ) : (
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
