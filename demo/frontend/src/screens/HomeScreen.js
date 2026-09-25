import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator, Dimensions, Image, RefreshControl, SafeAreaView, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '../../App';
import { extractErrorMessage } from '../api/auth';
import { fetchBanners, fetchProducts } from '../api/products';
import { HOST } from '../api/client';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, PRIMARY } from '../constants';

export default function HomeScreen({ navigation, route }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('All');
  const [banners, setBanners] = useState([]);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const carousel = useRef(null);
  const bannerIndex = useRef(0);
  const screenWidth = Dimensions.get('window').width;

  const load = useCallback(async () => {
    try {
      setError(null);
      setProducts(await fetchProducts());
      setBanners(await fetchBanners());
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => {
    if (route.params?.orderSuccess) {
      setShowOrderSuccess(true);
      navigation.setParams({ orderSuccess: false });
    }
  }, [route.params?.orderSuccess, navigation]);
  useEffect(() => {
    if (banners.length < 2) return undefined;
    const timer = setInterval(() => {
      bannerIndex.current = (bannerIndex.current + 1) % banners.length;
      carousel.current?.scrollTo({ x: bannerIndex.current * (screenWidth - 32), animated: true });
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length, screenWidth]);

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

        {showOrderSuccess && <View style={styles.successCard}>
          <View style={styles.successIcon}><Ionicons name="checkmark" size={20} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.successTitle}>Order successfully placed!</Text>
            <Text style={styles.successSub}>Thanks for shopping with us.</Text>
          </View>
          <TouchableOpacity onPress={() => setShowOrderSuccess(false)} style={styles.continueBtn}>
            <Text style={styles.continueText}>Continue shopping</Text>
          </TouchableOpacity>
        </View>}

        {banners.length > 0 && <View style={styles.carouselWrap}>
          <ScrollView ref={carousel} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => { bannerIndex.current = Math.round(e.nativeEvent.contentOffset.x / (screenWidth - 32)); }}>
            {banners.map((item) => <Image key={item.id} source={{ uri: `${HOST}${item.imageUrl}` }}
              style={[styles.bannerImage, { width: screenWidth - 32 }]} resizeMode="cover" />)}
          </ScrollView>
          {banners.length > 1 && <View style={styles.bannerDots}>{banners.map((b, i) =>
            <View key={b.id} style={[styles.bannerDot, i === activeBanner && styles.bannerDotActive]} />)}</View>}
        </View>}

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
  carouselWrap: { marginHorizontal: 16, marginTop: 2, marginBottom: 4, overflow: 'hidden', borderRadius: 18,
    backgroundColor: '#dbeafe', elevation: 3 },
  successCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 14,
    padding: 12, borderRadius: 16, backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#bbf7d0' },
  successIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: '#166534', fontWeight: '800', fontSize: 14 },
  successSub: { color: '#4b7b5b', fontSize: 12, marginTop: 2 },
  continueBtn: { backgroundColor: '#16a34a', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 9 },
  continueText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  bannerImage: { height: 170, borderRadius: 18 },
  bannerDots: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  bannerDot: { width: 7, height: 7, borderRadius: 5, backgroundColor: 'rgba(255,255,255,.65)' },
  bannerDotActive: { width: 18, backgroundColor: '#fff' },
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
