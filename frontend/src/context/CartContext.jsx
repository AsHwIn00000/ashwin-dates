import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Each cart item is unique by _id + selectedWeight
  const cartKey = (item) => `${item._id}-${item.selectedWeight || '500g'}`;

  const addToCart = (product, quantity = 1) => {
    const key = cartKey(product);
    setCart(prev => {
      const exists = prev.find(i => cartKey(i) === key);
      if (exists) {
        return prev.map(i => cartKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (key) => setCart(prev => prev.filter(i => cartKey(i) !== key));

  const updateQuantity = (key, quantity) => {
    if (quantity < 1) return removeFromCart(key);
    setCart(prev => prev.map(i => cartKey(i) === key ? { ...i, quantity } : i));
  };

  const clearCart = () => setCart([]);

  const getWeightInKg = (weightStr) => {
    if (!weightStr) return 0.5;
    const match = weightStr.match(/^(\d+(?:\.\d+)?)\s*(g|kg)$/i);
    if (!match) return 0.5;
    const val = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === 'kg') return val;
    if (unit === 'g') return val / 1000;
    return 0.5;
  };

  const total = cart.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalWeight = cart.reduce((sum, i) => sum + getWeightInKg(i.selectedWeight || '500g') * i.quantity, 0);
  const shipping = Math.round(totalWeight * 90);
  const grandTotal = total + shipping;

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, count, totalWeight, shipping, grandTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
