const defaultLocale = "en-US";

const buildCurrencyFormatter = (options: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(defaultLocale, {
    style: "currency",
    currency: "USD",
    ...options,
  });

export const formatCurrency = (
  amount: number,
  options: Intl.NumberFormatOptions = {}
) =>
  buildCurrencyFormatter({
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);

export const formatCurrencyWhole = (
  amount: number,
  options: Intl.NumberFormatOptions = {}
) =>
  buildCurrencyFormatter({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);

export const formatPercentage = (
  value: number,
  digits = 2,
  withSign = true
) => {
  const sign = withSign ? (value >= 0 ? "+" : "") : "";
  return `${sign}${value.toFixed(digits)}%`;
};
