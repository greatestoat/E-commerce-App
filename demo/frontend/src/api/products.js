import { Platform } from 'react-native';
import { api } from './client';

export async function fetchProducts() {
  const { data } = await api.get('/products');
  return data;
}

export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

// image: the asset object from expo-image-picker ({ uri, fileName, mimeType })
export async function createProduct({ name, description, price, image }) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', description);
  formData.append('price', String(price));

  if (Platform.OS === 'web') {
    // On web, `image.uri` is a blob: URL — fetch it to get a real Blob/File
    const response = await fetch(image.uri);
    const blob = await response.blob();
    formData.append('image', blob, image.fileName || `photo_${Date.now()}.jpg`);
  } else {
    // Native (Android/iOS) — RN's fetch polyfill understands this shape directly
    formData.append('image', {
      uri: image.uri,
      name: image.fileName || `photo_${Date.now()}.jpg`,
      type: image.mimeType || 'image/jpeg',
    });
  }

  const { data } = await api.post('/products', formData, {
    // Let the browser/RN set Content-Type + boundary itself — don't hardcode it
    headers: { 'Content-Type': undefined },
  });
  return data;
}

export async function deleteProduct(id) {
  await api.delete(`/products/${id}`);
}