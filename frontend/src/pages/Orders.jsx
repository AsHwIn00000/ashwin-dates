import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { FiDownload, FiRotateCcw, FiXCircle } from 'react-icons/fi';

const STATUS_COLORS = {
  processing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  return_requested: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  returned: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400',
};

const STEPS = ['processing', 'confirmed', 'shipped', 'delivered'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalType, setModalType] = useState(null); // 'cancel' or 'return'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reason, setReason] = useState('');
  const [submittingModal, setSubmittingModal] = useState(false);

  useEffect(() => {
    api.get('/orders/my')
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const downloadPDF = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${orderId}.pdf`;
      a.click();
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please enter a reason');
      return;
    }
    setSubmittingModal(true);
    try {
      const endpoint = `/orders/${selectedOrder._id}/${modalType}`;
      const { data } = await api.post(endpoint, { reason });
      toast.success(
        modalType === 'cancel'
          ? 'Order cancelled successfully'
          : 'Return request submitted successfully'
      );
      // update state
      setOrders(prev => prev.map(o => o._id === selectedOrder._id ? data.order : o));
      setModalType(null);
      setSelectedOrder(null);
      setReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmittingModal(false);
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8">
          <p className="text-6xl mb-4">📦</p>
          <p className="text-gray-500 dark:text-gray-400 mb-5 font-medium">No orders found in your account history</p>
          <Link to="/products" className="bg-gradient-to-r from-[#3d6b35] to-[#6b4226] text-white px-8 py-3 rounded-full font-bold hover:opacity-85 transition">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Order ID</p>
                    <p className="font-mono text-sm text-gray-700 dark:text-gray-300 font-semibold">
                      {order.orderNumber || `#ORD-${order._id.slice(-6).toUpperCase()}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Date</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Total Amount</p>
                    <p className="font-bold text-[#3d6b35] dark:text-green-400 text-sm">₹{order.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Status</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize mt-0.5 ${STATUS_COLORS[order.orderStatus]}`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => downloadPDF(order._id)}
                    className="flex items-center gap-1 text-xs text-[#3d6b35] hover:text-white border border-[#3d6b35]/40 hover:bg-[#3d6b35] px-3.5 py-1.5 rounded-xl font-bold transition duration-200"
                  >
                    <FiDownload size={13} /> Invoice
                  </button>

                  {['processing', 'confirmed'].includes(order.orderStatus) && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setModalType('cancel');
                      }}
                      className="flex items-center gap-1 text-xs text-red-600 hover:text-white border border-red-300 hover:bg-red-600 px-3.5 py-1.5 rounded-xl font-bold transition duration-200"
                    >
                      <FiXCircle size={13} /> Cancel Order
                    </button>
                  )}

                  {order.orderStatus === 'delivered' && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setModalType('return');
                      }}
                      className="flex items-center gap-1 text-xs text-orange-600 hover:text-white border border-orange-300 hover:bg-orange-600 px-3.5 py-1.5 rounded-xl font-bold transition duration-200"
                    >
                      <FiRotateCcw size={13} /> Return
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-2">Items ordered</p>
                <div className="flex flex-wrap gap-2">
                  {order.products.map((p, i) => (
                    <span key={i} className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-3.5 py-1.5 rounded-xl font-semibold border border-gray-100 dark:border-gray-800">
                      {p.name} {p.weight ? `(${p.weight})` : ''} × {p.quantity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Delivery Progress Timeline */}
              {['cancelled', 'return_requested', 'returned'].includes(order.orderStatus) ? (
                <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-900/30 rounded-2xl p-4 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      order.orderStatus === 'cancelled' ? 'bg-red-500' : 'bg-orange-500'
                    }`} />
                    <span className="font-extrabold capitalize text-gray-800 dark:text-gray-200">
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-1.5 font-medium pl-4">
                    Reason: {order.cancelReason || order.returnReason || 'No reason provided'}
                  </p>
                </div>
              ) : (
                <div className="mt-6 px-1 mb-2">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-4">Delivery Status</p>
                  <div className="relative flex justify-between items-center w-full">
                    {/* Line behind */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 z-0 rounded" />
                    
                    {/* Active Line Progress */}
                    <div 
                      className="absolute top-1/2 left-0 h-0.5 bg-[#3d6b35] -translate-y-1/2 z-0 transition-all duration-500 rounded" 
                      style={{
                        width: `${(Math.max(0, STEPS.indexOf(order.orderStatus)) / 3) * 100}%`
                      }}
                    />

                    {STEPS.map((step, idx) => {
                      const currentIdx = STEPS.indexOf(order.orderStatus);
                      const isActive = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={step} className="flex flex-col items-center z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                            isActive 
                              ? 'bg-[#3d6b35] text-white ring-4 ring-green-100 dark:ring-green-950' 
                              : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className={`text-[10px] mt-1.5 font-bold capitalize ${
                            isCurrent 
                              ? 'text-[#3d6b35] dark:text-green-400 font-extrabold scale-105' 
                              : isActive 
                                ? 'text-gray-700 dark:text-gray-300' 
                                : 'text-gray-400'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[11px] text-gray-500">
                <div>
                  Payment: <span className="capitalize font-bold text-gray-700 dark:text-gray-300">{order.paymentMethod}</span> —{' '}
                  <span className={`font-bold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
                {order.shippingPrice > 0 && (
                  <div>
                    Shipping Fee: <span className="font-bold text-gray-700 dark:text-gray-300">₹{order.shippingPrice}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel / Return Modal */}
      {modalType && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {modalType === 'cancel' ? 'Cancel Order' : 'Return Order Request'}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Order ID: <span className="font-mono font-semibold">{selectedOrder.orderNumber || `#ORD-${selectedOrder._id.slice(-6).toUpperCase()}`}</span>
            </p>
            
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                  Reason for {modalType === 'cancel' ? 'cancellation' : 'return'}
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    modalType === 'cancel'
                      ? "Tell us why you're cancelling this order..."
                      : "Please tell us what's wrong with the items..."
                  }
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-gray-800 dark:text-white resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalType(null);
                    setSelectedOrder(null);
                    setReason('');
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingModal}
                  className={`px-5 py-2 rounded-xl text-sm font-bold text-white ${
                    modalType === 'cancel'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  } disabled:opacity-50 transition`}
                >
                  {submittingModal ? 'Submitting...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
