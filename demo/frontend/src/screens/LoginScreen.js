import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { extractErrorMessage, login } from '../api/auth';
import { useAuth } from '../../App';

export default function LoginScreen({ navigation }) {
  const { handleAuthSuccess } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password) {
      setError('Please enter your username and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await login(username.trim(), password);
      handleAuthSuccess(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="storefront" size={38} color="#fff" />
          </View>
          <Text style={styles.appName}>ShopApp</Text>
          <Text style={styles.tagline}>Sign in to your account</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Username */}
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#c0c7d0"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#c0c7d0"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#9ca3af"
              />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{String(error)}</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Navigate to Register */}
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineBtnText}>Create an Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PRIMARY = '#2f6fed';
const BG = '#f0f4ff';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  // Header
  header: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: { fontSize: 26, fontWeight: '800', color: '#1e3a5f', letterSpacing: 0.5 },
  tagline: { fontSize: 14, color: '#6b7280', marginTop: 4 },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 5,
  },

  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 15, color: '#111827' },
  eyeBtn: { padding: 4 },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    gap: 6,
  },
  errorText: { flex: 1, color: '#ef4444', fontSize: 13 },

  // Buttons
  btn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: { opacity: 0.65 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { color: '#9ca3af', marginHorizontal: 12, fontSize: 13 },

  outlineBtn: {
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: { color: PRIMARY, fontSize: 15, fontWeight: '700' },
});
