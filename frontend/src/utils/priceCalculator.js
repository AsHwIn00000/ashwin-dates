export const WEIGHT_OPTIONS = ['100g', '250g', '500g', '750g', '1kg'];

export const getWeightMultiplier = (weightStr) => {
  if (!weightStr) return 1;
  const lower = weightStr.toLowerCase().trim();
  if (lower === '100g') return 0.1;
  if (lower === '250g' || lower.includes('250')) return 0.25;
  if (lower === '500g' || lower.includes('500')) return 0.5;
  if (lower === '750g' || lower.includes('750')) return 0.75;
  if (lower === '1kg' || lower.includes('1kg')) return 1.0;

  const match = lower.match(/^(\d+(?:\.\d+)?)\s*(g|kg)$/);
  if (!match) return 1;
  const val = parseFloat(match[1]);
  const unit = match[2];
  return unit === 'kg' ? val : val / 1000;
};

export const calculatePriceForWeight = (product, weightStr) => {
  if (!product) return 0;
  if (product.prices && product.prices[weightStr] !== undefined && product.prices[weightStr] !== null && Number(product.prices[weightStr]) > 0) {
    return Number(product.prices[weightStr]);
  }
  const basePricePerKg = Number(product.pricePerKg || product.price || 0);
  const multiplier = getWeightMultiplier(weightStr);
  return Math.round(basePricePerKg * multiplier);
};
