import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
import { colors } from './theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator id="main-tabs"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Populares' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}

const headerOptions = {
  headerShown: true,
  title: '',
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
        <Stack.Screen name="Achievements" component={AchievementsScreen} options={headerOptions} />
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
