import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';

const STATUSES = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  processing: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/all').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { orderStatus: status });
    setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: status } : o));
    toast.success('Status updated');
  };

  const downloadPDF = async (orderId) => {
    const res = await api.get(`/orders/${orderId}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url; a.download = `order-${orderId}.pdf`; a.click();
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Orders ({orders.length})</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="bg-white rounded-2xl shadow p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-400">Order ID</p>
                <p className="font-mono text-sm">{order._id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Customer</p>
                <p className="text-sm font-medium">{order.userId?.name || 'N/A'}</p>
                <p className="text-xs text-gray-400">{order.userId?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="font-bold text-purple-700">₹{order.totalAmount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Payment</p>
                <p className="text-sm capitalize">{order.paymentMethod} — <span className={order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}>{order.paymentStatus}</span></p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <select
                  value={order.orderStatus}
                  onChange={e => updateStatus(order._id, e.target.value)}
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${STATUS_COLORS[order.orderStatus]}`}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={() => downloadPDF(order._id)} className="flex items-center gap-1 text-sm text-purple-600 border border-purple-300 px-3 py-1 rounded-full hover:bg-purple-50">
                <FiDownload size={14} /> PDF
              </button>
            </div>
            <div className="border-t pt-3 text-sm text-gray-600">
              <p className="font-medium mb-1">Items:</p>
              <div className="flex flex-wrap gap-2">
                {order.products.map((p, i) => (
                  <span key={i} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{p.name} × {p.quantity}</span>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Ship to: {order.shippingAddress?.name}, {order.shippingAddress?.city}, {order.shippingAddress?.state}
              </p>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-center py-8 text-gray-500">No orders yet</p>}
      </div>
    </div>
  );
}
