import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '../../App';
import { extractErrorMessage } from '../api/auth';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, PRIMARY } from '../constants';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('All');

  const load = useCallback(async () => {
    try {
      setError(null);
      setProducts(await fetchProducts());
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const open = (p) => navigation.navigate('ProductDetail', { id: p.id, product: p });

  // only categories that actually have products
  const categories = useMemo(() => {
    const present = new Set(products.map((p) => p.category).filter(Boolean));
    const known = CATEGORIES.map((c) => c.name).filter((n) => present.has(n));
    const extra = [...present].filter((n) => !known.includes(n));
    return [...known, ...extra];
  }, [products]);

  const q = query.trim().toLowerCase();
  const filtered = products.filter((p) =>
    (selected === 'All' || p.category === selected) &&
    (!q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)));

  const showSections = selected === 'All' && !q;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <View style={styles.banner}>
          <Text style={styles.greeting}>Hello, {user?.username} 👋</Text>
          <Text style={styles.bannerSub}>What are you shopping for today?</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products…"
              placeholderTextColor="#9ca3af"
              value={query}
              onChangeText={setQuery}
            />
            {!!query && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {['All', ...categories].map((c) => (
            <TouchableOpacity key={c} onPress={() => setSelected(c)}
              style={[styles.chip, selected === c && styles.chipActive]}>
              <Text style={[styles.chipText, selected === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading && <ActivityIndicator style={{ marginTop: 40 }} size="large" color={PRIMARY} />}
        {error && <Text style={styles.error}>{error}</Text>}

        {!loading && showSections && categories.map((cat) => (
          <View key={cat} style={{ marginBottom: 8 }}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{cat}</Text>
              <TouchableOpacity onPress={() => setSelected(cat)}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 12, paddingBottom: 6 }}>
              {products.filter((p) => p.category === cat).map((p) => (
                <ProductCard key={p.id} product={p} style={{ width: 160 }} onPress={() => open(p)} />
              ))}
            </ScrollView>
          </View>
        ))}

        {!loading && !showSections && (
          <View style={styles.grid}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} style={styles.gridItem} onPress={() => open(p)} />
            ))}
          </View>
        )}

        {!loading && !error && (showSections ? products.length === 0 : filtered.length === 0) && (
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={44} color="#d1d5db" />
            <Text style={styles.emptyText}>{products.length === 0 ? 'No products yet' : 'No products found'}</Text>
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4ff' },
  banner: { backgroundColor: PRIMARY, padding: 20, paddingTop: 32,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, paddingHorizontal: 12, marginTop: 16, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, outlineStyle: 'none' },
  chips: { paddingHorizontal: 12, paddingVertical: 14, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e5e7eb' },
  chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1e3a5f' },
  seeAll: { color: PRIMARY, fontWeight: '600', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
  gridItem: { width: '47.5%' },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#9ca3af', marginTop: 8, fontWeight: '600' },
  error: { color: 'red', textAlign: 'center', padding: 8 },
});