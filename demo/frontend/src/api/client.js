import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 8080;

// Derive the backend host from Expo's own dev-server address so it works
// automatically on emulators, physical devices (Expo Go/LAN), and the web
// preview alike, without needing to hardcode a machine-specific IP.
function resolveHost() {
  if (Platform.OS === 'web') {
    return 'localhost';
  }

  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      return host;
    }
  }

  // Fallback: Android emulator maps 10.0.2.2 to the host machine's localhost.
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

const HOST = `http://${resolveHost()}:${API_PORT}`;

export const api = axios.create({
  baseURL: `${HOST}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export { HOST };
