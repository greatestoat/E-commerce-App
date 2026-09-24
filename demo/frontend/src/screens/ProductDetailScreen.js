import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet,
  Text, TouchableOpacity, useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HOST } from '../api/client';
import { fetchProduct } from '../api/products';
import { PRIMARY, discountPercent } from '../constants';

const lines = (t) => (t || '').split('\n').map((s) => s.trim()).filter(Boolean);

export default function ProductDetailScreen({ route }) {
  const { id, product: initial } = route.params;
  const [product, setProduct] = useState(initial || null);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchProduct(id).then(setProduct).catch(() => { if (!initial) setError('Could not load product'); });
  }, [id]);

  if (!product) {
    return <View style={styles.center}>{error ? <Text>{error}</Text> : <ActivityIndicator size="large" color={PRIMARY} />}</View>;
  }

  const gallery = [product.imageUrl, ...(product.images || [])].filter(Boolean);
  const off = discountPercent(product);
  const outOfStock = product.stock !== null && product.stock !== undefined && product.stock <= 0;
  const lowStock = !outOfStock && product.stock != null && product.stock <= 5;
  const specs = lines(product.specifications).map((l) => {
    const i = l.indexOf(':');
    return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : [l, ''];
  });
  const notYet = (what) => Alert.alert(what, 'Cart & checkout coming soon.');

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <FlatList
          data={gallery}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(u, i) => u + i}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => (
            <Image source={{ uri: `${HOST}${item}` }} style={{ width, height: 320 }} resizeMode="contain" />
          )}
          style={{ backgroundColor: '#fff' }}
        />
        {gallery.length > 1 && (
          <View style={styles.dots}>
            {gallery.map((_, i) => <View key={i} style={[styles.dot, i === index && styles.dotActive]} />)}
          </View>
        )}

        <View style={styles.section}>
          {!!product.brand && <Text style={styles.brand}>{product.brand}</Text>}
          <Text style={styles.name}>{product.name}</Text>

          {product.rating > 0 && (
            <View style={styles.ratingPill}>
              <Text style={styles.ratingText}>{Number(product.rating).toFixed(1)}</Text>
              <Ionicons name="star" size={11} color="#fff" />
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            {off > 0 && <Text style={styles.old}>₹{product.originalPrice}</Text>}
            {off > 0 && <Text style={styles.off}>{off}% off</Text>}
          </View>

          <Text style={[styles.stock, { color: outOfStock ? '#dc2626' : lowStock ? '#d97706' : '#16a34a' }]}>
            {outOfStock ? 'Out of stock' : lowStock ? `Only ${product.stock} left!` : 'In stock'}
          </Text>
        </View>

        {lines(product.highlights).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Highlights</Text>
            {lines(product.highlights).map((h, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>{h}</Text>
              </View>
            ))}
          </View>
        )}

        {!!product.description && (
          <View style={styles.section}>
            <Text style={styles.heading}>Description</Text>
            <Text style={styles.body}>{product.description}</Text>
          </View>
        )}

        {specs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Specifications</Text>
            {specs.map(([k, v], i) => (
              <View key={i} style={[styles.specRow, i % 2 === 0 && { backgroundColor: '#f9fafb' }]}>
                <Text style={styles.specKey}>{k}</Text><Text style={styles.specVal}>{v}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: 12 + insets.bottom }]}>
        <TouchableOpacity style={[styles.btn, styles.cartBtn, outOfStock && styles.disabled]}
          disabled={outOfStock} onPress={() => notYet('Add to Cart')}>
          <Ionicons name="cart-outline" size={18} color={PRIMARY} />
          <Text style={[styles.btnText, { color: PRIMARY }]}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.buyBtn, outOfStock && styles.disabled]}
          disabled={outOfStock} onPress={() => notYet('Buy Now')}>
          <Text style={[styles.btnText, { color: '#fff' }]}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4ff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 10, backgroundColor: '#fff' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#d1d5db' },
  dotActive: { backgroundColor: PRIMARY, width: 18 },
  section: { backgroundColor: '#fff', marginTop: 8, padding: 16 },
  brand: { color: PRIMARY, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 4 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-start',
    backgroundColor: '#16a34a', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 8 },
  ratingText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 12 },
  price: { fontSize: 26, fontWeight: '800', color: '#111827' },
  old: { fontSize: 15, color: '#9ca3af', textDecorationLine: 'line-through' },
  off: { fontSize: 15, color: '#16a34a', fontWeight: '700' },
  stock: { marginTop: 8, fontWeight: '600' },
  heading: { fontSize: 16, fontWeight: '700', color: '#1e3a5f', marginBottom: 10 },
  body: { color: '#374151', lineHeight: 21 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bullet: { color: PRIMARY, fontWeight: '800' },
  bulletText: { flex: 1, color: '#374151', lineHeight: 20 },
  specRow: { flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 8 },
  specKey: { width: '40%', color: '#6b7280' },
  specVal: { flex: 1, color: '#111827', fontWeight: '500' },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 12,
    padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e5e7eb' },
  btn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12 },
  cartBtn: { borderWidth: 1.5, borderColor: PRIMARY, backgroundColor: '#fff' },
  buyBtn: { backgroundColor: PRIMARY },
  btnText: { fontWeight: '700', fontSize: 15 },
  disabled: { opacity: 0.4 },
});