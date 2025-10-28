/**
 * Format number as Nigerian Naira currency
 * @param amount - Number to format
 * @returns Formatted currency string (e.g., "₦1,234.56")
 */
export function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format number as currency without decimals
 * @param amount - Number to format
 * @returns Formatted currency string (e.g., "₦1,234")
 */
export function formatCurrencyCompact(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
