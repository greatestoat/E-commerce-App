import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { readAccount, writeAccount } from '../api/products';
import { PRIMARY } from '../constants';

export default function CheckoutScreen({ route, navigation }) {
  const { items = [], address, fromCart } = route.params || {};
  const [placing, setPlacing] = useState(false);
  const total = items.reduce((sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 1), 0);
  const placeOrder = async () => {
    setPlacing(true);
    try {
      const orders = await readAccount('orders');
      const order = { id: Date.now(), date: new Date().toLocaleDateString(), address,
        items: items.map((x) => ({ productId: x.product.id, name: x.product.name, quantity: x.quantity || 1, price: x.product.price })), total };
      await writeAccount('orders', [order, ...orders]);
      if (fromCart) await writeAccount('cart', []);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Home', params: { orderSuccess: true } } }],
      });
    } catch (e) { Alert.alert('Could not place order', e.response?.data || e.message); }
    finally { setPlacing(false); }
  };
  return <ScrollView style={styles.root} contentContainerStyle={styles.content}>
    <Text style={styles.title}>Review your order</Text>
    <View style={styles.card}><Text style={styles.heading}>Delivering to</Text><Text style={styles.name}>{address?.name} · {address?.phone}</Text><Text style={styles.muted}>{[address?.line1, address?.line2, address?.city, address?.state, address?.postalCode].filter(Boolean).join(', ')}</Text></View>
    <View style={styles.card}><Text style={styles.heading}>Items</Text>{items.map((item) => <View key={item.product.id} style={styles.item}><Text style={styles.name}>{item.product.name} × {item.quantity || 1}</Text><Text style={styles.name}>₹{Number(item.product.price) * Number(item.quantity || 1)}</Text></View>)}<View style={styles.total}><Text style={styles.heading}>Total</Text><Text style={styles.totalPrice}>₹{total}</Text></View></View>
    <Text style={styles.muted}>Payment on delivery · Order confirmation</Text>
    <TouchableOpacity disabled={placing} style={styles.button} onPress={placeOrder}><Text style={styles.buttonText}>{placing ? 'Placing order…' : 'Place order'}</Text></TouchableOpacity>
  </ScrollView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#f0f4ff' }, content: { padding: 16 }, title: { fontSize: 24, color: '#1e3a5f', fontWeight: '800', marginVertical: 8 }, card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 12 }, heading: { color: '#1e3a5f', fontWeight: '800', fontSize: 16 }, name: { color: '#253858', fontWeight: '600', marginTop: 8 }, muted: { color: '#718096', lineHeight: 20, marginTop: 8 }, item: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderColor: '#edf0f5' }, total: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }, totalPrice: { fontSize: 18, fontWeight: '800', color: '#111827' }, button: { alignItems: 'center', backgroundColor: PRIMARY, padding: 16, borderRadius: 13, marginTop: 20 }, buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 } });
