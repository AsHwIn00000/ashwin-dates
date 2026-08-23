import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { FiShoppingCart, FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiPackage, FiBell, FiChevronRight, FiShield } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin && !isAuthPage) {
      const fetchAdminOrders = () => {
        api.get('/orders/all')
          .then(res => setRecentOrders(res.data || []))
          .catch(err => console.error('Failed to fetch admin orders:', err));
      };
      fetchAdminOrders();
      const interval = setInterval(fetchAdminOrders, 20000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, isAuthPage]);

  const pendingOrders = recentOrders.filter(o => o.orderStatus === 'processing' || o.orderStatus === 'pending');
  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  return (
    <nav className="bg-gradient-to-r from-[#3F6A35] via-[#5A582E] to-[#6B4327] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Ashwin Dates" className="h-10 w-10 object-contain rounded-full bg-white/10 p-0.5" />
          <div className="leading-tight">
            <span className="text-base font-extrabold text-white">Ashwin</span>
            <span className="block text-xs font-medium text-green-100 -mt-0.5">Dates &amp; Dry Fruits</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        {!isAuthPage && (
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-green-100">
            <Link to="/" className="hover:text-white transition font-semibold">Home</Link>
            <Link to="/products" className="hover:text-white transition font-semibold">Products</Link>
            {!isAdmin && (
              <Link to="/cart" className="hover:text-white transition font-semibold flex items-center gap-1.5">
                My Cart {count > 0 && <span className="bg-yellow-400 text-[#3F6A35] text-xs px-1.5 py-0.5 rounded-full font-bold">{count}</span>}
              </Link>
            )}
            {user && !isAdmin && (
              <Link to="/orders" className="hover:text-white transition font-semibold flex items-center gap-1">
                <FiPackage size={14} /> My Orders
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1 bg-yellow-400 text-[#3F6A35] font-extrabold px-3 py-1 rounded-full text-xs hover:bg-yellow-300 transition shadow">
                <FiShield size={12} /> Admin Panel
              </Link>
            )}
          </div>
        )}

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={toggle} className="p-2 rounded-full border border-green-300/40 text-green-100 hover:bg-white/10 transition" aria-label="Toggle theme">
            {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

          {/* Admin Notification Bell */}
          {isAdmin && !isAuthPage && (
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-full border border-yellow-400/40 text-yellow-300 hover:bg-white/10 transition"
                title="Admin Notifications"
              >
                <FiBell size={18} />
                {pendingOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {pendingOrders.length}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-3 text-gray-800 dark:text-white z-50">
                  <div className="px-4 pb-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <span className="font-extrabold text-sm flex items-center gap-1.5 text-[#3F6A35] dark:text-green-400">
                      <FiBell size={14} /> New Order Alerts
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 px-2 py-0.5 rounded-full font-bold">
                      {pendingOrders.length} Pending
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    {recentOrders.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">No orders received yet</div>
                    ) : (
                      recentOrders.slice(0, 4).map(o => (
                        <Link
                          key={o._id}
                          to="/admin/orders"
                          onClick={() => setShowNotifs(false)}
                          className="p-3 block hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                        >
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className="text-gray-900 dark:text-white">{o.orderNumber || `ORD-${o._id.slice(-6).toUpperCase()}`}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                              o.orderStatus === 'processing' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                              o.orderStatus === 'delivered'  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {o.orderStatus}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                            <span>{o.shippingAddress?.name || 'Customer'}</span>
                            <span className="font-extrabold text-[#3F6A35] dark:text-green-400">₹{o.totalAmount}</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-gray-100 dark:border-gray-700 text-center">
                    <Link
                      to="/admin/orders"
                      onClick={() => setShowNotifs(false)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3F6A35] dark:text-green-400 hover:underline"
                    >
                      Manage All Orders <FiChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isAuthPage && (
            <>
              {user ? (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white font-bold text-xs bg-white/10 px-3 py-1.5 rounded-full">
                    Hi, {user.name?.split(' ')[0]}
                  </span>
                  <button onClick={handleLogout} className="flex items-center gap-1 text-red-200 hover:text-white text-xs font-semibold">
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-white text-[#3F6A35] px-5 py-1.5 rounded-full text-sm font-bold hover:bg-green-50 transition">
                  Login
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          <button onClick={toggle} className="p-1.5 rounded-full border border-green-300/40 text-green-100">
            {dark ? <FiSun size={14} /> : <FiMoon size={14} />}
          </button>
          {!isAuthPage && (
            <>
              {!isAdmin && (
                <Link to="/cart" className="relative p-1">
                  <FiShoppingCart size={20} className="text-green-100" />
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-[#3F6A35] text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {count}
                    </span>
                  )}
                </Link>
              )}
              <button onClick={() => setOpen(!open)}>
                {open ? <FiX size={22} className="text-white" /> : <FiMenu size={22} className="text-white" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {!isAuthPage && open && (
        <div className="md:hidden bg-gradient-to-b from-[#3F6A35] via-[#5A582E] to-[#6B4327] border-t border-white/10 px-6 py-4 flex flex-col gap-4 text-sm text-green-100">
          <Link to="/" onClick={() => setOpen(false)} className="hover:text-white font-semibold">Home</Link>
          <Link to="/products" onClick={() => setOpen(false)} className="hover:text-white font-semibold">Products</Link>
          {!isAdmin && (
            <Link to="/cart" onClick={() => setOpen(false)} className="hover:text-white font-semibold">My Cart ({count})</Link>
          )}
          {user && !isAdmin && (
            <Link to="/orders" onClick={() => setOpen(false)} className="hover:text-white font-semibold">My Orders</Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-1 text-yellow-300 font-bold">
              <FiShield size={13} /> Admin Panel ({pendingOrders.length} new)
            </Link>
          )}
          {user ? (
            <button onClick={handleLogout} className="text-red-300 text-left font-semibold">Logout</button>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="text-white font-bold">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
