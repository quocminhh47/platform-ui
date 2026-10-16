const FREE_LABEL = 'Miễn phí';

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

/**
 * Single price formatter for every course list/detail view.
 * Zero (or an invalid value) is "Miễn phí"; positive amounts use vi-VN VND without decimals.
 */
export function formatPrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) {
    return FREE_LABEL;
  }
  return vndFormatter.format(price);
}
