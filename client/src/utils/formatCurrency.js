export const formatCurrency = (amount) => {
  const value = typeof amount === "number" ? amount : parseFloat(amount || 0);

  // Format with dot as thousands separator (Vietnamese style)
  const formattedValue = value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedValue}₫`;
};
