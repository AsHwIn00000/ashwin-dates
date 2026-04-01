import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) { toast.error('Please login to checkout'); navigate('/login'); return; }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <FiShoppingBag size={64} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Add some products to get started!</p>
        <Link to="/products" className="bg-gradient-to-r from-[#3d6b35] to-[#6b4226] text-white px-8 py-3 rounded-full font-semibold hover:opacity-80 transition">
          Shop Now
        </Link>
      </div>
    );
  }

  const shipping = total >= 500 ? 0 : 50;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={`${item._id}-${item.selectedWeight}`} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.images?.[0]
                  ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                  : <span className="text-2xl">🌴</span>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm line-clamp-1">{item.name}</h3>
                <span className="inline-block text-xs font-semibold text-white bg-gradient-to-r from-[#3d6b35] to-[#6b4226] px-2 py-0.5 rounded-full mt-0.5">
                  {item.selectedWeight || '500g'}
                </span>
                <p className="text-sm font-bold mt-1 text-[#3d6b35] dark:text-green-400">₹{item.price}</p>
              </div>
              <div className="flex items-center border dark:border-gray-700 rounded-xl overflow-hidden text-sm">
                <button onClick={() => updateQuantity(`${item._id}-${item.selectedWeight}`, item.quantity - 1)} className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold">−</button>
                <span className="px-3 py-1.5 font-semibold">{item.quantity}</span>
                <button onClick={() => updateQuantity(`${item._id}-${item.selectedWeight}`, item.quantity + 1)} className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold">+</button>
              </div>
              <p className="font-bold text-gray-800 dark:text-gray-200 w-16 text-right text-sm">
                ₹{(item.price * item.quantity).toFixed(0)}
              </p>
              <button onClick={() => removeFromCart(`${item._id}-${item.selectedWeight}`)} className="text-red-400 hover:text-red-600 ml-1">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{total.toFixed(0)}</span></div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            {total < 500 && <p className="text-xs text-green-600">Add ₹{(500 - total).toFixed(0)} more for free shipping!</p>}
          </div>
          <div className="border-t dark:border-gray-700 pt-3 flex justify-between font-bold text-lg mb-4">
            <span className="dark:text-white">Total</span>
            <span className="text-[#3d6b35] dark:text-green-400">₹{(total + shipping).toFixed(0)}</span>
          </div>
          <button onClick={handleCheckout}
            className="w-full bg-gradient-to-r from-[#3d6b35] to-[#6b4226] text-white py-3 rounded-xl font-bold hover:opacity-80 transition">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
