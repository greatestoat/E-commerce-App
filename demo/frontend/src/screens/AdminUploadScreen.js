import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, Image, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createProduct } from '../api/products';
import { extractErrorMessage } from '../api/auth';
import { useAuth } from '../../App';

export default function AdminUploadScreen({ navigation }) {
  const { user } = useAuth();
  const role = user?.role;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (role !== 'ADMIN') {
    return (
      <View style={styles.center}>
        <Text>You don't have access to this page.</Text>
      </View>
    );
  }

  const pickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission needed', 'Allow photo access to pick an image.');
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
  });
  if (!result.canceled) {
    setImage(result.assets[0]);
  }
};

  const handleSubmit = async () => {
    if (!name || !price || !image) {
      Alert.alert('Missing info', 'Name, price, and an image are required.');
      return;
    }
    setSubmitting(true);
    try {
      await createProduct({ name, description, price: Number(price), image });
      Alert.alert('Success', 'Product uploaded.');
      setName(''); setDescription(''); setPrice(''); setImage(null);
      navigation.navigate('Shop');
    } catch (e) {
      Alert.alert('Upload failed', extractErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Product name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Button title="Pick image" onPress={pickImage} />
      {image && <Image source={{ uri: image.uri }} style={styles.preview} />}

      <View style={{ marginTop: 20 }}>
        {submitting
          ? <ActivityIndicator />
          : <Button title="Upload product" onPress={handleSubmit} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { marginTop: 12, marginBottom: 4, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  preview: { width: 150, height: 150, marginTop: 12, borderRadius: 8 },
});