import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../App';

const QUICK_LINKS = [
  { icon: 'bag-handle-outline', label: 'Orders', color: '#3b82f6' },
  { icon: 'heart-outline', label: 'Wishlist', color: '#ec4899' },
  { icon: 'star-outline', label: 'Reviews', color: '#f59e0b' },
  { icon: 'gift-outline', label: 'Offers', color: '#10b981' },
];

export default function HomeScreen() {
  const { user } = useAuth();

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Banner */}
        <View style={styles.banner}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.username} 👋</Text>
            <Text style={styles.bannerSub}>Welcome back to ShopApp</Text>
          </View>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{initials}</Text>
          </View>
        </View>

        {/* Search Bar placeholder */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <Text style={styles.searchPlaceholder}>Search products…</Text>
        </View>

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickGrid}>
          {QUICK_LINKS.map(({ icon, label, color }) => (
            <View key={label} style={styles.quickCard}>
              <View style={[styles.quickIcon, { backgroundColor: color + '1a' }]}>
                <Ionicons name={icon} size={24} color={color} />
              </View>
              <Text style={styles.quickLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Featured placeholder */}
        <Text style={styles.sectionTitle}>Featured</Text>
        <View style={styles.featuredCard}>
          <Ionicons name="flash-outline" size={32} color="#2f6fed" />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.featuredTitle}>Flash Sale — Up to 50% Off</Text>
            <Text style={styles.featuredSub}>Limited time deals just for you</Text>
          </View>
        </View>

        {/* Activity placeholder */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.emptyCard}>
          <Ionicons name="receipt-outline" size={40} color="#d1d5db" />
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubText}>Start shopping to see your orders here</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = '#2f6fed';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4ff' },

  // Banner
  banner: {
    backgroundColor: PRIMARY,
    padding: 24,
    paddingTop: 32,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarSmallText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 14,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchPlaceholder: { color: '#9ca3af', fontSize: 14 },

  // Sections
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a5f',
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
  },

  // Quick grid
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 20,
    gap: 8,
  },
  quickCard: {
    width: '22%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: { fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center' },

  // Featured
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  featuredTitle: { fontSize: 15, fontWeight: '700', color: '#1e40af' },
  featuredSub: { fontSize: 12, color: '#3b82f6', marginTop: 3 },

  // Empty state
  emptyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#6b7280', marginTop: 12 },
  emptySubText: { fontSize: 12, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
});
