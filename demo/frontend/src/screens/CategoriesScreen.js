import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import { CATEGORIES } from '../constants';

// ---- Porcelain & Jade palette (same as HomeScreen) -----------------------
const PORCELAIN = '#FBFAF8';
const SAGE = '#EAF2EC';
const JADE = '#4F8368';
const JADE_DARK = '#233028';
const BLUSH = '#F7C9C0';
const MUTED = '#A4B3AC';

export default function CategoriesScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const categories = useMemo(() => {
    const present = new Set(products.map((p) => p.category).filter(Boolean));
    const known = CATEGORIES.filter((c) => present.has(c.name));
    const extras = [...present].filter((name) => !CATEGORIES.some((c) => c.name === name))
      .map((name) => ({ name, icon: 'pricetag-outline' }));
    return [...known, ...extras];
  }, [products]);

  useFocusEffect(useCallback(() => {
    let active = true;
    fetchProducts().then((items) => { if (active) setProducts(items); })
      .catch(() => { if (active) setProducts([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  const visible = selected ? products.filter((p) => p.category === selected) : products;
  const open = (product) => navigation.navigate('ProductDetail', { id: product.id, product });

  return <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}>
      <Text style={styles.eyebrow}>Explore the store</Text>
      <Text style={styles.title}>Categories</Text>
      <Text style={styles.subtitle}>Browse products by what you’re looking for.</Text>
    </View>

    <View style={styles.categoryGrid}>
      <TouchableOpacity onPress={() => setSelected(null)} style={[styles.categoryCard, !selected && styles.categorySelected]}>
        <View style={[styles.iconWrap, !selected && styles.iconSelected]}><Ionicons name="apps-outline" size={20} color={!selected ? '#fff' : JADE} /></View>
        <Text style={[styles.categoryName, !selected && styles.categoryNameSelected]}>All products</Text>
        <Text style={[styles.count, !selected && styles.countSelected]}>{products.length} items</Text>
      </TouchableOpacity>
      {categories.map((category) => {
        const count = products.filter((p) => p.category === category.name).length;
        const active = selected === category.name;
        return <TouchableOpacity key={category.name} onPress={() => setSelected(category.name)} style={[styles.categoryCard, active && styles.categorySelected]}>
          <View style={[styles.iconWrap, active && styles.iconSelected]}><Ionicons name={category.icon} size={20} color={active ? '#fff' : JADE} /></View>
          <Text numberOfLines={1} style={[styles.categoryName, active && styles.categoryNameSelected]}>{category.name}</Text>
          <Text style={[styles.count, active && styles.countSelected]}>{count} {count === 1 ? 'item' : 'items'}</Text>
        </TouchableOpacity>;
      })}
    </View>

    <View style={styles.productHeader}>
      <View><Text style={styles.productHeading}>{selected || 'All products'}</Text>
        <Text style={styles.productSub}>{visible.length} products</Text></View>
      {selected && <TouchableOpacity onPress={() => setSelected(null)}><Text style={styles.clear}>Show all</Text></TouchableOpacity>}
    </View>
    {loading ? <ActivityIndicator style={{ marginTop: 36 }} color={JADE} size="large" /> : visible.length > 0
      ? <View style={styles.products}>{visible.map((product) => <ProductCard key={product.id} product={product} style={styles.product} onPress={() => open(product)} />)}</View>
      : <View style={styles.empty}><Ionicons name="file-tray-outline" size={38} color={MUTED} /><Text style={styles.emptyText}>No products in this category yet.</Text></View>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PORCELAIN },
  content: { paddingBottom: 28 },

  // ---- header ----
  header: {
    backgroundColor: SAGE, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 26,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  eyebrow: { color: JADE, fontSize: 11, letterSpacing: 0.4, fontWeight: '700' },
  title: { color: JADE_DARK, fontSize: 27, fontWeight: '700', marginTop: 6 },
  subtitle: { color: MUTED, marginTop: 5, fontSize: 13 },

  // ---- category grid ----
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginTop: 18 },
  categoryCard: {
    width: '47.5%', minHeight: 112, backgroundColor: '#fff', borderRadius: 18, padding: 13,
    shadowColor: JADE_DARK, shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2,
  },
  categorySelected: { backgroundColor: '#fff', shadowOpacity: 0.1, borderWidth: 1.5, borderColor: JADE },
  iconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: SAGE, alignItems: 'center', justifyContent: 'center' },
  iconSelected: { backgroundColor: JADE },
  categoryName: { color: JADE_DARK, fontWeight: '700', marginTop: 10, fontSize: 13.5 },
  categoryNameSelected: { color: JADE_DARK },
  count: { color: MUTED, fontSize: 11, marginTop: 3 },
  countSelected: { color: JADE },

  // ---- product list header ----
  productHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 24, marginBottom: 12 },
  productHeading: { color: JADE_DARK, fontSize: 19, fontWeight: '700', textTransform: 'capitalize' },
  productSub: { color: MUTED, fontSize: 12, marginTop: 3 },
  clear: { color: JADE, fontWeight: '700', fontSize: 12.5 },

  // ---- product grid ----
  products: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 12 },
  product: { width: '47.5%' },

  // ---- empty ----
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: MUTED, marginTop: 8, fontSize: 13, fontWeight: '500' },
});