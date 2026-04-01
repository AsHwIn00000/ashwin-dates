import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import { FiDownload } from 'react-icons/fi';

const STATUS_COLORS = {
  processing: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const downloadPDF = async (orderId) => {
    const res = await api.get(`/orders/${orderId}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${orderId}.pdf`;
    a.click();
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link to="/products" className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-2xl shadow p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Order ID</p>
                  <p className="font-mono text-sm text-gray-700">{order._id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="font-bold text-purple-700">₹{order.totalAmount}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.orderStatus]}`}>
                  {order.orderStatus}
                </span>
                <button
                  onClick={() => downloadPDF(order._id)}
                  className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 border border-purple-300 px-3 py-1 rounded-full"
                >
                  <FiDownload size={14} /> PDF
                </button>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-gray-400 mb-2">Items</p>
                <div className="flex flex-wrap gap-2">
                  {order.products.map((p, i) => (
                    <span key={i} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                      {p.name} {p.weight ? `(${p.weight})` : ''} × {p.quantity}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Payment: <span className="capitalize font-medium">{order.paymentMethod}</span> —{' '}
                <span className={order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
