import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { HOST } from '../api/client';
import { fetchProducts, readAccount, writeAccount } from '../api/products';
import { PRIMARY } from '../constants';

const LABELS = { cart: 'My Cart', wishlist: 'Wishlist', addresses: 'Saved Addresses', orders: 'My Orders' };
const EMPTY_ADDRESS = { name: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '' };

export default function AccountDataScreen({ route, navigation }) {
  const section = route.params?.section || 'cart';
  const checkoutProduct = route.params?.checkoutProduct;
  const checkoutCart = route.params?.checkoutCart;
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [records, allProducts] = await Promise.all([readAccount(section), fetchProducts()]);
      setData(records || []); setProducts(allProducts || []);
    } catch (e) { Alert.alert('Could not load', e.response?.data || e.message); }
  }, [section]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const persist = async (next) => { setData(next); await writeAccount(section, next); };
  const goCheckout = async (selectedAddress) => {
    try {
      const items = checkoutProduct ? [{ productId: checkoutProduct.id, quantity: 1 }]
        : checkoutCart ? await readAccount('cart') : data;
      const found = items.map((item) => ({ ...item, product: products.find((p) => p.id === item.productId) })).filter((x) => x.product);
      if (!found.length) return Alert.alert('Cart is empty', 'Add a product to your cart first.');
      navigation.navigate('Checkout', { items: found, address: selectedAddress, fromCart: !checkoutProduct });
    } catch (e) { Alert.alert('Could not start checkout', e.response?.data || e.message); }
  };

  const saveAddress = async () => {
    if (!address.name.trim() || !address.phone.trim() || !address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.postalCode.trim())
      return Alert.alert('Complete the address', 'Name, phone, street, city, state and postal code are required.');
    setBusy(true);
    try {
      const next = [...data, { ...address, id: `${Date.now()}`, isDefault: data.length === 0 }];
      await persist(next); setAddress(EMPTY_ADDRESS);
      if (checkoutProduct || checkoutCart) goCheckout(next[next.length - 1]);
      else Alert.alert('Address saved', 'Your address is ready for the next order.');
    } catch (e) { Alert.alert('Could not save address', e.response?.data || e.message); }
    finally { setBusy(false); }
  };

  const productById = (id) => products.find((p) => p.id === id);
  const changeQty = async (id, amount) => {
    const next = data.map((x) => x.productId === id ? { ...x, quantity: Math.max(1, (x.quantity || 1) + amount) } : x);
    await persist(next);
  };
  const removeItem = async (id) => persist(data.filter((x) => x.productId !== id));
  const addToCart = async (productId) => {
    const cart = await readAccount('cart');
    const existing = cart.find((x) => x.productId === productId);
    await writeAccount('cart', existing ? cart.map((x) => x.productId === productId ? { ...x, quantity: (x.quantity || 1) + 1 } : x) : [...cart, { productId, quantity: 1 }]);
    Alert.alert('Added to cart', 'This product is in your cart now.');
  };
  const updateAddress = (key, value) => setAddress((current) => ({ ...current, [key]: value }));

  return <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.title}>{checkoutProduct || checkoutCart ? 'Choose delivery address' : LABELS[section]}</Text>
    {(checkoutProduct || checkoutCart) && <Text style={styles.subtitle}>Select a saved address or add a new one to continue.</Text>}

    {(section === 'cart' || section === 'wishlist') && data.map((item) => {
      const product = productById(item.productId);
      if (!product) return null;
      return <View key={item.productId} style={styles.productRow}>
        <Image source={{ uri: `${HOST}${product.imageUrl}` }} style={styles.image} />
        <View style={styles.productInfo}><Text numberOfLines={2} style={styles.productName}>{product.name}</Text>
          <Text style={styles.price}>₹{product.price}</Text>
          {section === 'cart' && <View style={styles.qtyRow}><TouchableOpacity onPress={() => changeQty(item.productId, -1)} style={styles.qty}><Text>−</Text></TouchableOpacity>
            <Text>{item.quantity || 1}</Text><TouchableOpacity onPress={() => changeQty(item.productId, 1)} style={styles.qty}><Text>+</Text></TouchableOpacity></View>}
          {section === 'wishlist' && <TouchableOpacity onPress={() => addToCart(item.productId)}><Text style={styles.link}>Add to cart</Text></TouchableOpacity>}
        </View>
        <TouchableOpacity onPress={() => removeItem(item.productId)}><Ionicons name="trash-outline" size={20} color="#dc2626" /></TouchableOpacity>
      </View>;
    })}
    {(section === 'cart' || section === 'wishlist') && data.length === 0 && <Text style={styles.empty}>Nothing here yet. Browse products and save your favorites.</Text>}
    {section === 'cart' && data.length > 0 && <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('AccountData', { section: 'addresses', checkoutCart: true })}><Text style={styles.primaryText}>Continue to checkout</Text></TouchableOpacity>}

    {section === 'addresses' && <>
      {data.map((item) => <View key={item.id} style={styles.addressCard}>
        <View style={styles.addressTitle}><Ionicons name="location" size={18} color={PRIMARY} /><Text style={styles.productName}>{item.name} · {item.phone}</Text></View>
        <Text style={styles.addressText}>{[item.line1, item.line2, item.city, item.state, item.postalCode].filter(Boolean).join(', ')}</Text>
        {(checkoutProduct || checkoutCart) && <TouchableOpacity style={styles.useAddress} onPress={() => goCheckout(item)}><Text style={styles.primaryText}>Deliver here</Text></TouchableOpacity>}
      </View>)}
      <Text style={styles.formTitle}>Add a new address</Text>
      {Object.entries({ name: 'Full name', phone: 'Phone number', line1: 'House / street address', line2: 'Apartment, landmark (optional)', city: 'City', state: 'State', postalCode: 'Postal code' }).map(([key, label]) =>
        <TextInput key={key} style={styles.input} placeholder={label} value={address[key]} onChangeText={(v) => updateAddress(key, v)} keyboardType={key === 'phone' || key === 'postalCode' ? 'phone-pad' : 'default'} />)}
      <TouchableOpacity style={styles.primaryBtn} disabled={busy} onPress={saveAddress}><Text style={styles.primaryText}>{busy ? 'Saving…' : 'Save address'}</Text></TouchableOpacity>
    </>}

    {section === 'orders' && data.map((order) => <View key={order.id} style={styles.orderCard}>
      <Text style={styles.productName}>Order #{String(order.id).slice(-7)}</Text><Text style={styles.addressText}>{order.date} · {order.items?.length || 0} item(s)</Text>
      {order.items?.map((x) => <Text key={x.productId} style={styles.addressText}>{x.name} × {x.quantity}</Text>)}
      <Text style={styles.price}>Total ₹{order.total}</Text><Text style={styles.addressText}>Delivering to {order.address?.name}: {order.address?.line1}, {order.address?.city}</Text>
    </View>)}
    {section === 'orders' && !data.length && <Text style={styles.empty}>Orders you place will appear here.</Text>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4ff' }, content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#1e3a5f', marginVertical: 8 }, subtitle: { color: '#718096', marginBottom: 12 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 12, borderRadius: 16, marginBottom: 10 },
  image: { width: 76, height: 76, borderRadius: 12, backgroundColor: '#f3f4f6' }, productInfo: { flex: 1 }, productName: { color: '#263852', fontWeight: '700' },
  price: { color: '#111827', fontWeight: '800', marginTop: 5 }, qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }, qty: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#eef3ff', alignItems: 'center', justifyContent: 'center' },
  link: { color: PRIMARY, fontWeight: '700', marginTop: 7 }, empty: { textAlign: 'center', color: '#718096', padding: 36, backgroundColor: '#fff', borderRadius: 16, marginTop: 8 },
  primaryBtn: { backgroundColor: PRIMARY, alignItems: 'center', borderRadius: 13, padding: 15, marginTop: 12 }, primaryText: { color: '#fff', fontWeight: '800' },
  addressCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10 }, addressTitle: { flexDirection: 'row', alignItems: 'center', gap: 7 }, addressText: { color: '#64748b', marginTop: 7, lineHeight: 20 }, useAddress: { backgroundColor: PRIMARY, alignSelf: 'flex-start', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 9, marginTop: 12 },
  formTitle: { color: '#1e3a5f', fontSize: 17, fontWeight: '800', marginVertical: 10 }, input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 11, padding: 13, marginBottom: 9 },
  orderCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10 },
});
