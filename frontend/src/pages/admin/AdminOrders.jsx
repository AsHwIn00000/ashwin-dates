import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';

const STATUSES = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'];
const STATUS_COLORS = {
  processing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  return_requested: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  returned: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/all').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { orderStatus: status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: status } : o));
      toast.success('Status updated successfully');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const downloadPDF = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `order-${orderId}.pdf`; a.click();
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">All Orders ({orders.length})</h1>
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order._id} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Order ID</p>
                <p className="font-mono text-sm text-gray-700 dark:text-gray-300 font-semibold">
                  {order.orderNumber || `#ORD-${order._id.slice(-6).toUpperCase()}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Customer</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{order.userId?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500 font-medium">{order.userId?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Total Amount</p>
                <p className="font-bold text-[#3d6b35] dark:text-green-400 text-sm">₹{order.totalAmount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Payment</p>
                <p className="text-xs capitalize font-semibold text-gray-700 dark:text-gray-300">
                  {order.paymentMethod} — <span className={order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}>{order.paymentStatus.toUpperCase()}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-1">Status</p>
                <select
                  value={order.orderStatus}
                  onChange={e => updateStatus(order._id, e.target.value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border border-transparent shadow-sm focus:outline-none ${STATUS_COLORS[order.orderStatus]}`}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <button 
                onClick={() => downloadPDF(order._id)} 
                className="flex items-center gap-1 text-xs text-[#3d6b35] border border-[#3d6b35]/40 hover:bg-[#3d6b35] hover:text-white px-3.5 py-1.5 rounded-xl font-bold transition duration-200"
              >
                <FiDownload size={13} /> PDF
              </button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-2">Items Ordered:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {order.products.map((p, i) => (
                  <span key={i} className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-3.5 py-1 rounded-xl font-semibold border border-gray-100 dark:border-gray-800">
                    {p.name} {p.weight ? `(${p.weight})` : ''} × {p.quantity}
                  </span>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 font-medium">
                <span className="font-bold">Ship to:</span> {order.shippingAddress?.name}, {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode} ({order.shippingAddress?.phone})
              </p>

              {(order.cancelReason || order.returnReason) && (
                <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-900/30 rounded-2xl p-4 mt-4 text-xs">
                  <span className="font-extrabold text-red-800 dark:text-red-400 uppercase tracking-wide">
                    {order.orderStatus === 'cancelled' ? 'Cancellation Reason: ' : 'Return Reason: '}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {order.cancelReason || order.returnReason}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 text-gray-500">
            No orders placed yet.
          </div>
        )}
      </div>
    </div>
  );
}
