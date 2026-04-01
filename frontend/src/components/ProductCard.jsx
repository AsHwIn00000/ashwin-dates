import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const WEIGHTS = ['100g', '250g', '500g', '1kg'];

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [selectedWeight, setSelectedWeight] = useState('500g');
  const price = product.prices?.[selectedWeight] || product.pricePerKg || 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!product.inStock) return;
    addToCart({ ...product, selectedWeight, price }, 1);
    toast.success(`${product.name} (${selectedWeight}) added to cart`);
  };

  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <Link to={`/products/${product._id}`} className="block relative bg-gray-50 dark:bg-gray-900 h-44 flex items-center justify-center overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition duration-300"
            onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 opacity-25">
            <span className="text-5xl">🌴</span>
            <span className="text-3xl font-black text-gray-400">{product.name.charAt(0)}</span>
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-wide">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <span className="text-xs text-gray-400 uppercase font-medium tracking-wide capitalize mb-0.5">{product.category}</span>
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 leading-snug mb-1 hover:underline">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <FiStar size={11} className="text-yellow-400 fill-yellow-400" />
          <span className="text-gray-400 text-xs">{product.rating?.toFixed(1) || '0.0'}</span>
          <span className={`ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full ${product.inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Weight selector */}
        <div className="grid grid-cols-4 gap-1 mb-2">
          {WEIGHTS.map(w => (
            <button key={w} onClick={() => setSelectedWeight(w)}
              className={`text-xs py-1 rounded-lg border font-medium transition ${
                selectedWeight === w
                  ? 'bg-gradient-to-r from-[#3d6b35] to-[#6b4226] text-white border-transparent'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-green-400'
              }`}>
              {w}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-base font-bold text-[#3d6b35] dark:text-green-400">₹{price}</span>
          <button onClick={handleAdd} disabled={!product.inStock}
            className="bg-gradient-to-r from-[#3d6b35] to-[#6b4226] text-white p-2 rounded-full hover:opacity-70 transition disabled:opacity-30 disabled:cursor-not-allowed">
            <FiShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
