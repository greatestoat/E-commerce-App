import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HOST } from '../api/client';
import { discountPercent } from '../constants';

export default function ProductCard({ product, onPress, style }) {
  const off = discountPercent(product);
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
      <View>
        <Image source={{ uri: `${HOST}${product.imageUrl}` }} style={styles.image} />
        {off > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{off}% OFF</Text></View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
      <View style={styles.row}>
        <Text style={styles.price}>₹{product.price}</Text>
        {off > 0 && <Text style={styles.old}>₹{product.originalPrice}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 8, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  image: { width: '100%', height: 130, borderRadius: 8, backgroundColor: '#e5e7eb' },
  badge: { position: 'absolute', top: 6, left: 6, backgroundColor: '#16a34a',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  name: { marginTop: 8, fontWeight: '600', color: '#111827' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 6 },
  price: { fontWeight: '700', color: '#111827' },
  old: { color: '#9ca3af', textDecorationLine: 'line-through', fontSize: 12 },
});