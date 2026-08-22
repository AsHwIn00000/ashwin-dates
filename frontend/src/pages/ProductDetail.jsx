import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiStar, FiArrowLeft } from 'react-icons/fi';

import { WEIGHT_OPTIONS, calculatePriceForWeight } from '../utils/priceCalculator';

const WEIGHTS = WEIGHT_OPTIONS;
const BRAND = '#3d6b35';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState('500g');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" />;
  if (!product) return null;

  const price = calculatePriceForWeight(product, selectedWeight);

  const handleAdd = () => {
    addToCart({ ...product, selectedWeight, price }, qty);
    toast.success(`${product.name} (${selectedWeight}) × ${qty} added to cart`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      toast.success('Thank you for your review!');
      setProduct(res.data.product);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
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
              <span className="text-gray-600 dark:text-gray-400 text-sm">{product.rating?.toFixed(1)} ({product.numReviews || 0} reviews)</span>
            </div>
            <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-5">{product.description}</p>

          {/* Weight selector */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Weight</p>
            <div className="grid grid-cols-5 gap-1.5">
              {WEIGHTS.map(w => (
                <button
                  key={w}
                  onClick={() => setSelectedWeight(w)}
                  className={`py-2 rounded-xl border-2 font-semibold text-xs sm:text-sm transition ${
                    selectedWeight === w ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400'
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
            <span className="text-4xl font-extrabold text-[#3d6b35] dark:text-green-400">₹{price * qty}</span>
            <span className="text-gray-400 text-sm ml-2">for {qty > 1 ? `${qty} × ${selectedWeight}` : selectedWeight}</span>
          </div>

          {/* All weight prices reference */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 sm:p-3.5 mb-5 border border-gray-100 dark:border-gray-800">
            <p className="text-[11px] sm:text-xs text-gray-500 mb-2 font-semibold">All weight options (Calculated from ₹{product.pricePerKg || product.price}/kg):</p>
            <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
              {WEIGHTS.map(w => (
                <div key={w} className="text-center bg-white dark:bg-gray-800/80 p-1.5 sm:p-2 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase">{w}</p>
                  <p className="text-xs sm:text-sm font-extrabold text-[#3d6b35] dark:text-green-400 mt-0.5">
                    ₹{calculatePriceForWeight(product, w)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity + Add */}
          {user?.role !== 'admin' ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center border dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-lg font-bold">−</button>
                <span className="px-4 py-2.5 font-semibold min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-lg font-bold">+</button>
              </div>
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className="flex-1 bg-gradient-to-r from-[#3d6b35] to-[#6b4226] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-80 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/10 dark:border-yellow-800 dark:text-yellow-400 rounded-xl p-3.5 text-sm font-semibold text-center">
              ⚠️ Administrator Account: Purchasing features are disabled.
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-gray-100 dark:border-gray-800 mt-12 pt-10">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Customer Reviews</h2>
        
        {/* Review list */}
        <div className="space-y-6 mb-10">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((r, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3d6b35] to-[#6b4226] text-white font-bold flex items-center justify-center text-sm shadow">
                      {r.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{r.name}</p>
                      <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={14}
                        className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pl-1">{r.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">No reviews yet for this product. Be the first to share your feedback!</p>
          )}
        </div>

        {/* Submit form */}
        {user ? (
          user.role !== 'admin' ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setReviewRating(stars)}
                        className="text-yellow-400 focus:outline-none hover:scale-110 transition duration-150"
                      >
                        <FiStar size={24} className={stars <= reviewRating ? "fill-yellow-400" : "text-gray-300"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Your Feedback</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us what you liked or disliked about this product..."
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-gray-800 dark:text-white resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-[#3d6b35] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : null
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 text-center border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please <Link to="/login" className="text-[#3d6b35] font-bold hover:underline">login</Link> to submit your review feedback.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


