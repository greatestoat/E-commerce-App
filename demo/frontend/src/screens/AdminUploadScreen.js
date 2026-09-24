import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { useAuth } from '../../App';
import { extractErrorMessage } from '../api/auth';
import { createProduct } from '../api/products';
import { CATEGORIES, PRIMARY } from '../constants';

const EMPTY = {
  name: '', brand: '', category: '', price: '', originalPrice: '', stock: '',
  rating: '', description: '', highlights: '', specifications: '',
};

export default function AdminUploadScreen({ navigation }) {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [customCat, setCustomCat] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user?.role !== 'ADMIN') {
    return <View style={styles.center}><Text>You don't have access to this page.</Text></View>;
  }

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const pick = async (multiple) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo access to pick images.');
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.7, allowsMultipleSelection: multiple,
    });
    if (res.canceled) return;
    if (multiple) setGallery((g) => [...g, ...res.assets]);
    else setImage(res.assets[0]);
  };

  const handleSubmit = async () => {
    const category = form.category === 'Other' && customCat.trim() ? customCat.trim() : form.category;
    if (!form.name.trim() || !form.price || !category || !image) {
      return Alert.alert('Missing info', 'Name, category, price and a main image are required.');
    }
    if (form.originalPrice && Number(form.originalPrice) <= Number(form.price)) {
      return Alert.alert('Check prices', 'Original price must be higher than the selling price.');
    }
    if (form.rating && (Number(form.rating) < 0 || Number(form.rating) > 5)) {
      return Alert.alert('Check rating', 'Rating must be between 0 and 5.');
    }
    setSubmitting(true);
    try {
      await createProduct({
        ...form, category,
        price: Number(form.price),
        image, gallery,
      });
      Alert.alert('Success', 'Product uploaded.');
      setForm(EMPTY); setImage(null); setGallery([]); setCustomCat('');
      navigation.navigate('Home');
    } catch (e) {
      Alert.alert('Upload failed', extractErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const field = (label, key, props = {}) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, props.multiline && { height: 90, textAlignVertical: 'top' }]}
        value={form[key]} onChangeText={set(key)} placeholderTextColor="#9ca3af" {...props} />
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Add product</Text>

      {field('Product name *', 'name')}
      {field('Brand', 'brand')}

      <Text style={styles.label}>Category *</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c.name} onPress={() => set('category')(c.name)}
            style={[styles.chip, form.category === c.name && styles.chipActive]}>
            <Text style={[styles.chipText, form.category === c.name && { color: '#fff' }]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {form.category === 'Other' && (
        <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Type category name"
          value={customCat} onChangeText={setCustomCat} placeholderTextColor="#9ca3af" />
      )}

      <View style={styles.row}>
        <View style={{ flex: 1 }}>{field('Selling price (₹) *', 'price', { keyboardType: 'numeric' })}</View>
        <View style={{ flex: 1 }}>{field('Original price (₹)', 'originalPrice', { keyboardType: 'numeric', placeholder: 'For discount' })}</View>
      </View>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>{field('Stock quantity', 'stock', { keyboardType: 'numeric' })}</View>
        <View style={{ flex: 1 }}>{field('Rating (0-5)', 'rating', { keyboardType: 'decimal-pad' })}</View>
      </View>

      {field('Description', 'description', { multiline: true })}
      {field('Highlights (one per line)', 'highlights', { multiline: true, placeholder: '6.5" AMOLED display\n5000 mAh battery' })}
      {field('Specifications (Key: Value, one per line)', 'specifications', { multiline: true, placeholder: 'RAM: 8 GB\nStorage: 128 GB' })}

      <Text style={styles.label}>Main image *</Text>
      <TouchableOpacity style={styles.pickBtn} onPress={() => pick(false)}>
        <Text style={styles.pickText}>{image ? 'Change main image' : 'Pick main image'}</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image.uri }} style={styles.preview} />}

      <Text style={styles.label}>More images (gallery)</Text>
      <TouchableOpacity style={styles.pickBtn} onPress={() => pick(true)}>
        <Text style={styles.pickText}>Add gallery images</Text>
      </TouchableOpacity>
      <View style={styles.chips}>
        {gallery.map((g, i) => (
          <TouchableOpacity key={i} onPress={() => setGallery((arr) => arr.filter((_, j) => j !== i))}>
            <Image source={{ uri: g.uri }} style={styles.thumb} />
            <Text style={styles.remove}>✕ remove</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 24 }}>
        {submitting
          ? <ActivityIndicator size="large" color={PRIMARY} />
          : <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
              <Text style={styles.submitText}>Upload product</Text>
            </TouchableOpacity>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#1e3a5f', marginTop: 12 },
  label: { marginTop: 14, marginBottom: 4, fontWeight: '600', color: '#374151' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, backgroundColor: '#fff' },
  row: { flexDirection: 'row', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
    borderColor: '#d1d5db', backgroundColor: '#fff' },
  chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  pickBtn: { borderWidth: 1, borderColor: PRIMARY, borderStyle: 'dashed', borderRadius: 8,
    padding: 12, alignItems: 'center' },
  pickText: { color: PRIMARY, fontWeight: '600' },
  preview: { width: 150, height: 150, marginTop: 10, borderRadius: 8 },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  remove: { fontSize: 10, color: '#dc2626', textAlign: 'center', marginTop: 2 },
  submit: { backgroundColor: PRIMARY, padding: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});