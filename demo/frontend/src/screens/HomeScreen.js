import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator, Dimensions, Image, RefreshControl, SafeAreaView, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '../../App';
import { extractErrorMessage } from '../api/auth';
import { fetchBanners, fetchProducts } from '../api/products';
import { HOST } from '../api/client';
import ProductCard from '../components/ProductCard';

// ---- Porcelain & Jade palette -------------------------------------------
// Drop these into your constants file and swap PRIMARY for JADE app-wide
// if you want the theme to carry through the rest of the app.
const PORCELAIN = '#FBFAF8';
const SAGE = '#EAF2EC';
const JADE = '#4F8368';
const JADE_DARK = '#233028';
const BLUSH = '#F7C9C0';
const BLUSH_DARK = '#7A3B31';
const MUTED = '#A4B3AC';

export default function HomeScreen({ navigation, route }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [banners, setBanners] = useState([]);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
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
      setActiveBanner(bannerIndex.current);
      carousel.current?.scrollTo({ x: bannerIndex.current * (screenWidth - 32), animated: true });
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length, screenWidth]);

  const open = (p) => navigation.navigate('ProductDetail', { id: p.id, product: p });

  const q = query.trim().toLowerCase();
  const filtered = products.filter((p) =>
    !q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={JADE}
          onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <View style={styles.hero}>
          <View style={styles.topbar}>
            <Text style={styles.brand}>Porcelain</Text>
            <TouchableOpacity style={styles.iconbtn}>
              <Ionicons name="notifications-outline" size={17} color={JADE_DARK} />
            </TouchableOpacity>
          </View>

          <Text style={styles.greeting}>Hello, {user?.username} 👋</Text>
          <Text style={styles.heroTitle}>Calm, considered,{'\n'}
            <Text style={styles.heroTitleAccent}>curated for you.</Text>
          </Text>

          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={MUTED} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products…"
              placeholderTextColor={MUTED}
              value={query}
              onChangeText={setQuery}
            />
            {!!query && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={MUTED} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {showOrderSuccess && <View style={styles.successCard}>
          <View style={styles.successIcon}><Ionicons name="checkmark" size={18} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.successTitle}>Order placed — nice pick!</Text>
            <Text style={styles.successSub}>Thanks for shopping with us.</Text>
          </View>
          <TouchableOpacity onPress={() => setShowOrderSuccess(false)} style={styles.continueBtn}>
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>}

        {banners.length > 0 && <View style={styles.carouselWrap}>
          <ScrollView ref={carousel} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              bannerIndex.current = Math.round(e.nativeEvent.contentOffset.x / (screenWidth - 32));
              setActiveBanner(bannerIndex.current);
            }}>
            {banners.map((item) => <Image key={item.id} source={{ uri: `${HOST}${item.imageUrl}` }}
              style={[styles.bannerImage, { width: screenWidth - 32 }]} resizeMode="cover" />)}
          </ScrollView>
          {banners.length > 1 && <View style={styles.bannerDots}>{banners.map((b, i) =>
            <View key={b.id} style={[styles.bannerDot, i === activeBanner && styles.bannerDotActive]} />)}</View>}
        </View>}

        {loading && <ActivityIndicator style={{ marginTop: 40 }} size="large" color={JADE} />}
        {error && <Text style={styles.error}>{error}</Text>}

        {!loading && <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionTitle}>{q ? 'Search results' : "Today's edit"}</Text>
            <Text style={styles.sectionCaption}>{q ? `${filtered.length} matches` : 'Find something you’ll love'}</Text>
          </View>
          {!q && <Text style={styles.seeAll}>See all</Text>}
        </View>}

        {!loading && (
          <View style={styles.grid}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} style={styles.gridItem} onPress={() => open(p)} />
            ))}
          </View>
        )}

        {!loading && !error && filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={44} color={MUTED} />
            <Text style={styles.emptyText}>{products.length === 0 ? 'No products yet' : 'No products found'}</Text>
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PORCELAIN },

  // ---- hero ----
  hero: {
    backgroundColor: SAGE,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 26,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 13, fontWeight: '700', color: JADE_DARK, letterSpacing: 0.4 },
  iconbtn: {
    width: 34, height: 34, borderRadius: 12, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: JADE_DARK, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  greeting: { fontSize: 13, color: MUTED, marginTop: 18, fontWeight: '500' },
  heroTitle: { fontSize: 25, fontWeight: '600', color: JADE_DARK, marginTop: 6, lineHeight: 32 },
  heroTitleAccent: { color: JADE, fontWeight: '700' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, paddingHorizontal: 14, marginTop: 20, gap: 9,
    shadowColor: JADE_DARK, shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: JADE_DARK, outlineStyle: 'none' },

  // ---- order success ----
  successCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 14,
    padding: 12, borderRadius: 18, backgroundColor: '#fff',
    shadowColor: JADE_DARK, shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2,
  },
  successIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: JADE, alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: JADE_DARK, fontWeight: '700', fontSize: 13.5 },
  successSub: { color: MUTED, fontSize: 11.5, marginTop: 2 },
  continueBtn: { backgroundColor: JADE, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  continueText: { color: '#fff', fontWeight: '700', fontSize: 11 },

  // ---- banner carousel ----
  carouselWrap: {
    marginHorizontal: 16, marginTop: 16, marginBottom: 4, overflow: 'hidden', borderRadius: 20,
    backgroundColor: SAGE,
    shadowColor: JADE_DARK, shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 3,
  },
  bannerImage: { height: 160, borderRadius: 20 },
  bannerDots: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  bannerDot: { width: 6, height: 6, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.6)' },
  bannerDotActive: { width: 16, backgroundColor: '#fff' },

  // ---- section head ----
  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 12, marginTop: 20,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: JADE_DARK },
  sectionCaption: { color: MUTED, fontSize: 12, marginTop: 3 },
  seeAll: { fontSize: 12.5, fontWeight: '700', color: JADE },

  // ---- grid ----
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
  gridItem: { width: '47.5%' },

  // ---- empty / error ----
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: MUTED, marginTop: 8, fontWeight: '600' },
  error: { color: BLUSH_DARK, textAlign: 'center', padding: 8, fontWeight: '600' },
});