import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { connectScreen } from './redux/helpers';
import LoginScreen from './screens/Login';
import RegisterScreen from './screens/Register';
import HomeScreen from './screens/Home';
import MovieDetailScreen from './screens/MovieDetail';
import ProfileScreen from './screens/Profile';
import ManageMoviesScreen from './screens/ManageMovies';
import AddMovieScreen from './screens/AddMovie';
import ManageUsersScreen from './screens/ManageUsers';
import AchievementsScreen from './screens/Achievements';
import { colors } from './theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
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

// Mismo patrón que en Clase 10: el Stack raíz decide qué screens montar
// según props.user.isLoggedIn (viene del store global vía connectScreen).
function RootNavigator({ user }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user.isLoggedIn ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            {/* Sin header nativo acá: el botón de "volver" va dibujado a
                mano, flotando sobre la imagen de fondo (ver MovieDetail.jsx),
                para que se vea como la referencia en vez de la barra gris de
                siempre. */}
            <Stack.Screen
              name="MovieDetail"
              component={MovieDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ManageMovies"
              component={ManageMoviesScreen}
              options={{
                headerShown: true,
                title: '',
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
              }}
            />
            <Stack.Screen
              name="AddMovie"
              component={AddMovieScreen}
              options={{
                headerShown: true,
                title: '',
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
              }}
            />
            <Stack.Screen
              name="ManageUsers"
              component={ManageUsersScreen}
              options={{
                headerShown: true,
                title: '',
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
              }}
            />
            <Stack.Screen
              name="Achievements"
              component={AchievementsScreen}
              options={{
                headerShown: true,
                title: '',
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function mapStateToProps(state) {
  return { user: state.users };
}

export default connectScreen(RootNavigator, mapStateToProps);
