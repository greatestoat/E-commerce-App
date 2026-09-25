import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { readAccount, writeAccount } from '../api/products';
import { PRIMARY } from '../constants';

export default function CheckoutScreen({ route, navigation }) {
  const { items = [], address, fromCart } = route.params || {};
  const [orderItems, setOrderItems] = useState(() => items.map((item) => ({ ...item, quantity: Math.max(1, Number(item.quantity) || 1) })));
  const [placing, setPlacing] = useState(false);
  const total = orderItems.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0);
  const changeQuantity = (productId, amount) => setOrderItems((current) => current.map((item) => {
    if (item.product.id !== productId) return item;
    const stock = Number(item.product.stock);
    const max = Number.isFinite(stock) && stock > 0 ? stock : Number.MAX_SAFE_INTEGER;
    return { ...item, quantity: Math.min(max, Math.max(1, item.quantity + amount)) };
  }));
  const placeOrder = async () => {
    setPlacing(true);
    try {
      const orders = await readAccount('orders');
      const order = { id: Date.now(), date: new Date().toLocaleDateString(), address,
        items: orderItems.map((x) => ({ productId: x.product.id, name: x.product.name, quantity: x.quantity, price: x.product.price })), total };
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
    <View style={styles.card}><Text style={styles.heading}>Items</Text>{orderItems.map((item) => <View key={item.product.id} style={styles.item}>
      <View style={styles.itemInfo}><Text style={styles.name}>{item.product.name}</Text><Text style={styles.lineTotal}>₹{Number(item.product.price) * item.quantity}</Text></View>
      <View style={styles.quantity}><TouchableOpacity accessibilityLabel="Decrease quantity" style={styles.quantityButton} onPress={() => changeQuantity(item.product.id, -1)}><Text style={styles.quantityButtonText}>−</Text></TouchableOpacity>
        <Text style={styles.quantityValue}>{item.quantity}</Text>
        <TouchableOpacity accessibilityLabel="Increase quantity" style={styles.quantityButton} disabled={Number(item.product.stock) > 0 && item.quantity >= Number(item.product.stock)} onPress={() => changeQuantity(item.product.id, 1)}><Text style={styles.quantityButtonText}>+</Text></TouchableOpacity></View>
      {Number(item.product.stock) > 0 && item.quantity >= Number(item.product.stock) && <Text style={styles.stockNote}>Maximum available: {item.product.stock}</Text>}
    </View>)}<View style={styles.total}><Text style={styles.heading}>Total</Text><Text style={styles.totalPrice}>₹{total}</Text></View></View>
    <Text style={styles.muted}>Payment on delivery · Order confirmation</Text>
    <TouchableOpacity disabled={placing} style={styles.button} onPress={placeOrder}><Text style={styles.buttonText}>{placing ? 'Placing order…' : 'Place order'}</Text></TouchableOpacity>
  </ScrollView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#f0f4ff' }, content: { padding: 16 }, title: { fontSize: 24, color: '#1e3a5f', fontWeight: '800', marginVertical: 8 }, card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 12 }, heading: { color: '#1e3a5f', fontWeight: '800', fontSize: 16 }, name: { color: '#253858', fontWeight: '600', marginTop: 8 }, muted: { color: '#718096', lineHeight: 20, marginTop: 8 }, item: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#edf0f5' }, itemInfo: { flex: 1, minWidth: 120 }, lineTotal: { color: '#111827', fontWeight: '700', marginTop: 5 }, quantity: { flexDirection: 'row', alignItems: 'center', gap: 10 }, quantityButton: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#eef3ff', alignItems: 'center', justifyContent: 'center' }, quantityButtonText: { color: PRIMARY, fontSize: 18, fontWeight: '800' }, quantityValue: { color: '#253858', fontWeight: '700', minWidth: 16, textAlign: 'center' }, stockNote: { width: '100%', color: '#b45309', fontSize: 11 }, total: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }, totalPrice: { fontSize: 18, fontWeight: '800', color: '#111827' }, button: { alignItems: 'center', backgroundColor: PRIMARY, padding: 16, borderRadius: 13, marginTop: 20 }, buttonText: { color: '#fff', fontWeight: '800' } });
