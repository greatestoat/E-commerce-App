import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { fetchCurrentUser } from './src/api/auth';
import { setAuthToken } from './src/api/client';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AdminUploadScreen from './src/screens/AdminUploadScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import AccountDataScreen from './src/screens/AccountDataScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';

const TOKEN_KEY = 'auth_token';

export const AuthContext = createContext(null);
export function useAuth() {
  return useContext(AuthContext);
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// user is now passed in so we can conditionally show the Admin tab
function MainTabs({ user }) {
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2f6fed',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Admin: focused ? 'add-circle' : 'add-circle-outline',
            Profile: focused ? 'person-circle' : 'person-circle-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      {isAdmin && <Tab.Screen name="Admin" component={AdminUploadScreen} />}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        try {
          const data = await fetchCurrentUser(storedToken);
          setUser({ ...data, token: storedToken });
        } catch {
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      }
      setBootstrapping(false);
    })();
  }, []);

  async function handleAuthSuccess(data) {
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setAuthToken(data.token);
    setUser(data);
  }

  async function handleLogout() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  }

  if (bootstrapping) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2f6fed" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, handleAuthSuccess, handleLogout }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        {user ? (
          <Stack.Navigator>
            <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
              {() => <MainTabs user={user} />}
            </Stack.Screen>
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ title: 'Product details' }}
            />
            <Stack.Screen name="AccountData" component={AccountDataScreen} options={{ title: 'Your account' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
          </Stack.Navigator>
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8faff' },
  tabBar: {
    height: 64,
    paddingBottom: 10,
    paddingTop: 6,
    backgroundColor: '#ffffff',
    borderTopWidth: 0,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
