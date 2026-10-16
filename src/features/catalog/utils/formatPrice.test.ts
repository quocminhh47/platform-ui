import { formatPrice } from './formatPrice';

const normalize = (value: string) => value.replace(/\s/g, ' ');

describe('formatPrice', () => {
  it('shows "Miễn phí" for zero and invalid prices', () => {
    expect(formatPrice(0)).toBe('Miễn phí');
    expect(formatPrice(-5)).toBe('Miễn phí');
    expect(formatPrice(Number.NaN)).toBe('Miễn phí');
  });

  it('formats positive amounts as vi-VN VND without decimals', () => {
    expect(normalize(formatPrice(79))).toBe('79 ₫');
    expect(normalize(formatPrice(49.99))).toBe('50 ₫');
    expect(normalize(formatPrice(1250000))).toBe('1.250.000 ₫');
  });
});
