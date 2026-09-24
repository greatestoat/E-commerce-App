import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, Image, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchProducts } from '../api/products';
import { HOST } from '../api/client';
import { extractErrorMessage } from '../api/auth';

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <Image source={{ uri: `${HOST}${item.imageUrl}` }} style={styles.image} />
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.price}>₹{item.price}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No products yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 8 },
  card: {
    flex: 1, margin: 6, backgroundColor: '#f7f7f7', borderRadius: 10,
    padding: 8, maxWidth: '47%',
  },
  image: { width: '100%', height: 130, borderRadius: 8, backgroundColor: '#e0e0e0' },
  name: { marginTop: 6, fontWeight: '600' },
  price: { marginTop: 2, color: '#444' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
  error: { color: 'red', textAlign: 'center', padding: 8 },
});