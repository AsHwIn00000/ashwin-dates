import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { FiShoppingCart, FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiSettings, FiPackage } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  return (
    <nav className="bg-gradient-to-r from-[#3F6A35] via-[#5A582E] to-[#6B4327] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo Branding */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Ashwin Dates" className="h-10 w-10 object-contain rounded-full bg-white/10 p-0.5" />
          <div className="leading-tight">
            <span className="text-base font-extrabold text-white">Ashwin</span>
            <span className="block text-xs font-medium text-green-100 -mt-0.5">Dates & Dry Fruits</span>
          </div>
        </Link>

        {/* Center Links (Hidden on Login/Register pages) */}
        {!isAuthPage && (
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-green-100">
            <Link to="/" className="hover:text-white transition font-semibold">Home</Link>
            <Link to="/products" className="hover:text-white transition font-semibold">Products</Link>
            {user?.role !== 'admin' && (
              <Link to="/cart" className="hover:text-white transition font-semibold flex items-center gap-1.5">
                My Cart {count > 0 && <span className="bg-yellow-400 text-[#3F6A35] text-xs px-1.5 py-0.5 rounded-full font-bold">{count}</span>}
              </Link>
            )}
            {user && user.role !== 'admin' && (
              <Link to="/orders" className="hover:text-white transition font-semibold flex items-center gap-1">
                <FiPackage size={14} /> My Orders
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1 bg-yellow-400 text-[#3F6A35] font-extrabold px-3 py-1 rounded-full text-xs hover:bg-yellow-300 transition">
                <FiSettings size={12} /> Admin Panel
              </Link>
            )}
          </div>
        )}

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={toggle} className="p-2 rounded-full border border-green-300/40 text-green-100 hover:bg-white/10 transition" aria-label="Toggle theme">
            {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

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

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-3">
          <button onClick={toggle} className="p-1.5 rounded-full border border-green-300/40 text-green-100">
            {dark ? <FiSun size={14} /> : <FiMoon size={14} />}
          </button>
          {!isAuthPage && (
            <>
              {user?.role !== 'admin' && (
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
          {user?.role !== 'admin' && (
            <Link to="/cart" onClick={() => setOpen(false)} className="hover:text-white font-semibold">My Cart ({count})</Link>
          )}
          {user && user.role !== 'admin' && (
            <Link to="/orders" onClick={() => setOpen(false)} className="hover:text-white font-semibold">My Orders</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-1 text-yellow-300 font-bold">
              <FiSettings size={13} /> Admin Panel
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
