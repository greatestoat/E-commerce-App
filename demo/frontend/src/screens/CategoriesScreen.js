import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, PRIMARY } from '../constants';

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
      <Text style={styles.eyebrow}>EXPLORE THE STORE</Text>
      <Text style={styles.title}>Categories</Text>
      <Text style={styles.subtitle}>Browse products by what you’re looking for.</Text>
    </View>

    <View style={styles.categoryGrid}>
      <TouchableOpacity onPress={() => setSelected(null)} style={[styles.categoryCard, !selected && styles.categorySelected]}>
        <View style={[styles.iconWrap, !selected && styles.iconSelected]}><Ionicons name="apps-outline" size={22} color={!selected ? '#fff' : PRIMARY} /></View>
        <Text style={[styles.categoryName, !selected && styles.categoryNameSelected]}>All products</Text>
        <Text style={[styles.count, !selected && styles.countSelected]}>{products.length} items</Text>
      </TouchableOpacity>
      {categories.map((category) => {
        const count = products.filter((p) => p.category === category.name).length;
        const active = selected === category.name;
        return <TouchableOpacity key={category.name} onPress={() => setSelected(category.name)} style={[styles.categoryCard, active && styles.categorySelected]}>
          <View style={[styles.iconWrap, active && styles.iconSelected]}><Ionicons name={category.icon} size={22} color={active ? '#fff' : PRIMARY} /></View>
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
    {loading ? <ActivityIndicator style={{ marginTop: 36 }} color={PRIMARY} size="large" /> : visible.length > 0
      ? <View style={styles.products}>{visible.map((product) => <ProductCard key={product.id} product={product} style={styles.product} onPress={() => open(product)} />)}</View>
      : <View style={styles.empty}><Ionicons name="file-tray-outline" size={38} color="#aab5c5" /><Text style={styles.emptyText}>No products in this category yet.</Text></View>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4ff' }, content: { paddingBottom: 28 },
  header: { backgroundColor: PRIMARY, paddingHorizontal: 18, paddingTop: 30, paddingBottom: 25, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  eyebrow: { color: 'rgba(255,255,255,.74)', fontSize: 10, letterSpacing: 1.2, fontWeight: '800' },
  title: { color: '#fff', fontSize: 27, fontWeight: '800', marginTop: 5 }, subtitle: { color: 'rgba(255,255,255,.84)', marginTop: 4, fontSize: 13 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 14, marginTop: 16 },
  categoryCard: { width: '48%', minHeight: 114, backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#e8edf7' },
  categorySelected: { backgroundColor: '#edf3ff', borderColor: PRIMARY },
  iconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#eef3ff', alignItems: 'center', justifyContent: 'center' },
  iconSelected: { backgroundColor: PRIMARY }, categoryName: { color: '#263852', fontWeight: '800', marginTop: 9 }, categoryNameSelected: { color: PRIMARY },
  count: { color: '#9aa5b5', fontSize: 11, marginTop: 3 }, countSelected: { color: '#5b7fc9' },
  productHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 22, marginBottom: 10 },
  productHeading: { color: '#1e3a5f', fontSize: 19, fontWeight: '800' }, productSub: { color: '#8a97ab', fontSize: 12, marginTop: 3 },
  clear: { color: PRIMARY, fontWeight: '700' }, products: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 12 }, product: { width: '47.5%' },
  empty: { alignItems: 'center', paddingVertical: 38 }, emptyText: { color: '#8a97ab', marginTop: 8, fontSize: 13 },
});
