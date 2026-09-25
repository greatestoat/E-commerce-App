import { Platform } from 'react-native';
import { api } from './client';

export async function fetchProducts(category) {
  const { data } = await api.get('/products', { params: category ? { category } : {} });
  return data;
}

export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

async function appendFile(formData, field, asset) {
  const name = asset.fileName || `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.jpg`;
  if (Platform.OS === 'web') {
    const blob = await (await fetch(asset.uri)).blob();
    formData.append(field, blob, name);
  } else {
    formData.append(field, { uri: asset.uri, name, type: asset.mimeType || 'image/jpeg' });
  }
}

// image: main asset; gallery: array of extra assets
export async function createProduct({ image, gallery = [], ...fields }) {
  const formData = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') formData.append(k, String(v));
  });
  await appendFile(formData, 'image', image);
  for (const g of gallery) await appendFile(formData, 'images', g);

  const { data } = await api.post('/products', formData, {
    headers: { 'Content-Type': undefined },
    timeout: 60000,
  });
  return data;
}

export async function deleteProduct(id) {
  await api.delete(`/products/${id}`);
}

export async function updateProduct(id, { image, gallery = [], ...fields }) {
  const formData = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') formData.append(k, String(v));
  });
  if (image) await appendFile(formData, 'image', image);
  for (const g of gallery) await appendFile(formData, 'images', g);
  const { data } = await api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': undefined }, timeout: 60000,
  });
  return data;
}

export async function fetchBanners() {
  const { data } = await api.get('/banners');
  return data;
}

export async function createBanner(image) {
  const formData = new FormData();
  await appendFile(formData, 'image', image);
  const { data } = await api.post('/banners', formData, {
    headers: { 'Content-Type': undefined }, timeout: 60000,
  });
  return data;
}

export async function deleteBanner(id) {
  await api.delete(`/banners/${id}`);
}

export async function readAccount(section) {
  const { data } = await api.get(`/account/${section}`);
  return data;
}

export async function writeAccount(section, data) {
  const { data: saved } = await api.put(`/account/${section}`, data);
  return saved;
}
