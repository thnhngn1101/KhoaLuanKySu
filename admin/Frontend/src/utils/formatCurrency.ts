export function formatVND(amount: number | string) {
  if (typeof amount === 'string') amount = parseFloat(amount);
  if (isNaN(amount)) return '0 ₫';
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
} 