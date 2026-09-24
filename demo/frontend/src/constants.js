export const PRIMARY = '#2f6fed';

export const CATEGORIES = [
  { name: 'Electronics', icon: 'phone-portrait-outline' },
  { name: 'Fashion', icon: 'shirt-outline' },
  { name: 'Home', icon: 'home-outline' },
  { name: 'Beauty', icon: 'sparkles-outline' },
  { name: 'Sports', icon: 'basketball-outline' },
  { name: 'Books', icon: 'book-outline' },
  { name: 'Toys', icon: 'game-controller-outline' },
  { name: 'Other', icon: 'grid-outline' },
];

export const discountPercent = (p) =>
  p.originalPrice && p.originalPrice > p.price
    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
    : 0;