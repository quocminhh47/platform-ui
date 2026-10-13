export function formatPrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) {
    return 'Free';
  }
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}
