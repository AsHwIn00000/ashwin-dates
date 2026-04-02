import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!/^\d{10}$/.test(form.phone)) errors.phone = 'Enter valid 10-digit phone number';
  if (!form.street.trim()) errors.street = 'Street address is required';
  if (!form.city.trim()) errors.city = 'City is required';
  if (!form.state.trim()) errors.state = 'State is required';
  if (!/^\d{6}$/.test(form.pincode)) errors.pincode = 'Enter valid 6-digit pincode';
  return errors;
}

const downloadPDF = async (orderId) => {
  try {
    const res = await api.get(`/orders/${orderId}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url; a.download = `order-${orderId}.pdf`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch { /* silent */ }
};

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [form, setForm] = useState({ name: user?.name || '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [errors, setErrors] = useState({});

  const shipping = total >= 500 ? 0 : 50;
  const grandTotal = total + shipping;

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const placeOrder = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data: order } = await api.post('/orders', {
        products: cart.map(i => ({ productId: i._id, weight: i.selectedWeight || '500g', quantity: i.quantity })),
        shippingAddress: form,
        paymentMethod,
      });

      if (paymentMethod === 'razorpay') {
        const { data: rzp } = await api.post('/payment/create-order', { orderId: order._id });
        const options = {
          key: rzp.key || import.meta.env.VITE_RAZORPAY_KEY_ID, amount: rzp.amount, currency: rzp.currency,
          name: 'Ashwin Dates & Dry Fruits', description: 'Order Payment',
          order_id: rzp.razorpayOrderId,
          handler: async (response) => {
            await api.post('/payment/verify', { ...response, orderId: order._id });
            clearCart();
            toast.success('Payment successful!');
            await downloadPDF(order._id);
            navigate('/orders');
          },
          prefill: { name: form.name, contact: form.phone },
          theme: { color: '#3d6b35' },
        };
        new window.Razorpay(options).open();
      } else {
        clearCart();
        toast.success('Order placed! Downloading invoice...');
        await downloadPDF(order._id);
        navigate('/orders');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Shipping Address</h2>
          <div className="space-y-3">
            {[
              { name: 'name', label: 'Full Name', placeholder: 'Your full name' },
              { name: 'phone', label: 'Phone Number', placeholder: '10-digit mobile number' },
              { name: 'street', label: 'Street Address', placeholder: '123 Main Street' },
              { name: 'city', label: 'City', placeholder: 'Chennai' },
              { name: 'state', label: 'State', placeholder: 'Tamil Nadu' },
              { name: 'pincode', label: 'Pincode', placeholder: '600001' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                <input name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                  className={`w-full border dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-gray-800 dark:text-white ${errors[f.name] ? 'border-red-400' : ''}`} />
                {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]}</p>}
              </div>
            ))}
          </div>

          <h2 className="text-lg font-bold text-gray-800 dark:text-white mt-6 mb-3">Payment Method</h2>
          <div className="space-y-2">
            {[
              { value: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when your order arrives' },
              { value: 'razorpay', label: '💳 Pay Online (Razorpay)', desc: 'UPI, Cards, Net Banking' },
            ].map(m => (
              <label key={m.value} className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition ${paymentMethod === m.value ? 'border-[#3d6b35] bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} className="mt-1" />
                <div>
                  <p className="font-medium text-sm dark:text-white">{m.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {cart.map(item => (
                <div key={`${item._id}-${item.selectedWeight}`} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.name} <span className="text-xs text-[#3d6b35] dark:text-green-400 font-semibold">({item.selectedWeight || '500g'})</span> × {item.quantity}
                  </span>
                  <span className="font-medium dark:text-white">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="border-t dark:border-gray-700 pt-3 space-y-2 text-sm">
              <div className="flex justify-between dark:text-gray-300"><span>Subtotal</span><span>₹{total.toFixed(0)}</span></div>
              <div className="flex justify-between dark:text-gray-300"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t dark:border-gray-700 dark:text-white">
                <span>Total</span>
                <span className="text-[#3d6b35] dark:text-green-400">₹{grandTotal.toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-3 mb-4 text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
            📄 Invoice PDF downloads automatically after placing the order.
          </div>

          <button onClick={placeOrder} disabled={loading}
            className="w-full bg-gradient-to-r from-[#3d6b35] to-[#6b4226] text-white py-4 rounded-xl font-bold text-base hover:opacity-80 transition disabled:opacity-50">
            {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
