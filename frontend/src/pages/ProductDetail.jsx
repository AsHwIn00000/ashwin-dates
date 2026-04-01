import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiStar, FiArrowLeft } from 'react-icons/fi';

const WEIGHTS = ['100g', '250g', '500g', '1kg'];
const BRAND = '#3d6b35';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState('500g');

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" />;
  if (!product) return null;

  const price = product.prices?.[selectedWeight] || product.pricePerKg || 0;

  const handleAdd = () => {
    addToCart({ ...product, selectedWeight, price }, qty);
    toast.success(`${product.name} (${selectedWeight}) × ${qty} added to cart`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white mb-6 text-sm">
        <FiArrowLeft /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden h-80 flex items-center justify-center">
            {product.images?.[imgIdx] ? (
              <img src={product.images[imgIdx]} alt={product.name}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none'; }} />
            ) : (
              <div className="flex flex-col items-center opacity-20">
                <span className="text-7xl">🌴</span>
                <span className="text-4xl font-black text-gray-400 mt-2">{product.name.charAt(0)}</span>
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 object-cover rounded-xl cursor-pointer border-2 transition ${imgIdx === i ? 'border-purple-600' : 'border-transparent'}`}
                  onError={e => { e.target.style.display = 'none'; }} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-xs text-gray-400 uppercase font-medium tracking-wide capitalize">{product.category}</span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1 mb-2">{product.name}</h1>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <FiStar className="text-yellow-400 fill-yellow-400" size={16} />
              <span className="text-gray-600 dark:text-gray-400 text-sm">{product.rating?.toFixed(1)}</span>
            </div>
            <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-5">{product.description}</p>

          {/* Weight selector */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Weight</p>
            <div className="grid grid-cols-4 gap-2">
              {WEIGHTS.map(w => (
                <button
                  key={w}
                  onClick={() => setSelectedWeight(w)}
                  className={`py-2.5 rounded-xl border-2 font-semibold text-sm transition ${
                    selectedWeight === w ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-400'
                  }`}
                  style={selectedWeight === w ? { backgroundColor: BRAND, borderColor: BRAND } : {}}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="mb-5">
            <span className="text-4xl font-extrabold text-[#3d6b35] dark:text-green-400">₹{price}</span>
            <span className="text-gray-400 text-sm ml-2">for {selectedWeight}</span>
          </div>

          {/* All weight prices reference */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 mb-5">
            <p className="text-xs text-gray-500 mb-2 font-medium">All weight options:</p>
            <div className="grid grid-cols-4 gap-2">
              {WEIGHTS.map(w => (
                <div key={w} className="text-center">
                  <p className="text-xs text-gray-400">{w}</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">₹{product.prices?.[w] || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity + Add */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border dark:border-gray-700 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-lg font-bold">−</button>
              <span className="px-4 py-2.5 font-semibold min-w-[40px] text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-lg font-bold">+</button>
            </div>
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="flex-1 bg-gradient-to-r from-[#3d6b35] to-[#6b4226] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-80 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiShoppingCart size={18} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


