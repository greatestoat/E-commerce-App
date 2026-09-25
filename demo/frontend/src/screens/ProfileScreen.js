import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../App';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { readAccount } from '../api/products';

const MENU_ITEMS = [
  { icon: 'cart-outline', label: 'My Cart', section: 'cart', color: '#3b82f6' },
  { icon: 'bag-handle-outline', label: 'My Orders', section: 'orders', color: '#3b82f6' },
  { icon: 'heart-outline', label: 'Wishlist', section: 'wishlist', color: '#ec4899' },
  { icon: 'location-outline', label: 'Saved Addresses', section: 'addresses', color: '#10b981' },
  { icon: 'notifications-outline', label: 'Notifications', color: '#f59e0b' },
  { icon: 'shield-checkmark-outline', label: 'Privacy & Security', color: '#8b5cf6' },
  { icon: 'help-circle-outline', label: 'Help & Support', color: '#6b7280' },
];

export default function ProfileScreen({ navigation }) {
  const { user, handleLogout } = useAuth();
  const [counts, setCounts] = useState({ cart: 0, wishlist: 0, orders: 0 });
  useFocusEffect(useCallback(() => {
    let active = true;
    Promise.all([readAccount('cart'), readAccount('wishlist'), readAccount('orders')]).then(([cart, wishlist, orders]) => {
      if (active) setCounts({ cart: cart.length, wishlist: wishlist.length, orders: orders.length });
    }).catch(() => {});
    return () => { active = false; };
  }, []));

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  function confirmLogout() {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out of your account?')) {
        handleLogout();
      }
      return;
    }

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => handleLogout(),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={14} color="#10b981" />
            <Text style={styles.badgeText}>Verified Account</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Orders', value: String(counts.orders) },
            { label: 'Wishlist', value: String(counts.wishlist) },
            { label: 'Reviews', value: '0' },
          ].map(({ label, value }) => (
            <View key={label} style={styles.statBox}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map(({ icon, label, color, section }, idx) => (
            <TouchableOpacity
              key={label}
              style={[styles.menuItem, idx < MENU_ITEMS.length - 1 && styles.menuBorder]}
              activeOpacity={0.7}
              onPress={() => label === 'Notifications' || label === 'Privacy & Security' || label === 'Help & Support'
                ? Alert.alert(label, 'This section is coming soon.')
                : navigation.navigate('AccountData', { section })}
            >
              <View style={[styles.menuIcon, { backgroundColor: color + '18' }]}>
                <Ionicons name={icon} size={20} color={color} />
              </View>
              <Text style={styles.menuLabel}>{label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>ShopApp v1.0.0</Text>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4ff' },

  // Header
  header: {
    padding: 20,
    paddingTop: 28,
    backgroundColor: '#2f6fed',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },

  // Avatar card
  avatarCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#2f6fed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#2f6fed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  username: { fontSize: 20, fontWeight: '800', color: '#1e3a5f' },
  email: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 10,
    gap: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#10b981' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1e3a5f' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 3, fontWeight: '500' },

  // Menu
  menuCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#374151' },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#ef4444' },

  version: { textAlign: 'center', fontSize: 12, color: '#c0c7d0' },
});
