import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { FiShoppingCart, FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiSettings } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  return (
    <nav className="bg-gradient-to-r from-[#3d6b35] to-[#6b4226] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Ashwin Dates" className="h-10 w-10 object-contain rounded-full bg-white/10 p-0.5" />
          <div className="leading-tight">
            <span className="text-base font-extrabold text-white">Ashwin</span>
            <span className="block text-xs font-medium text-green-100 -mt-0.5">Dates & Dry Fruits</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-green-100">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/products" className="hover:text-white transition">Products</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-1 bg-white text-[#3d6b35] font-bold px-3 py-1 rounded-full text-xs hover:bg-green-50 transition">
              <FiSettings size={12} /> Admin Panel
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggle} className="p-2 rounded-full border border-green-300/40 text-green-100 hover:bg-white/10 transition" aria-label="Toggle theme">
            {dark ? <FiSun size={15} /> : <FiMoon size={15} />}
          </button>
          <Link to="/cart" className="relative p-2">
            <FiShoppingCart size={20} className="text-green-100 hover:text-white" />
            {count > 0 && (
              <span className="absolute top-0 right-0 bg-yellow-400 text-[#3d6b35] text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-green-100 text-xs">Hi, {user.name?.split(' ')[0]}</span>
              <Link to="/orders" className="text-green-100 hover:text-white transition">Orders</Link>
              <button onClick={handleLogout} className="flex items-center gap-1 text-red-300 hover:text-red-200 text-xs">
                <FiLogOut size={13} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-white text-[#3d6b35] px-5 py-1.5 rounded-full text-sm font-bold hover:bg-green-50 transition">
              Login
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-3">
          <button onClick={toggle} className="p-1.5 rounded-full border border-green-300/40 text-green-100">
            {dark ? <FiSun size={14} /> : <FiMoon size={14} />}
          </button>
          <Link to="/cart" className="relative">
            <FiShoppingCart size={20} className="text-green-100" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-[#3d6b35] text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>
          <button onClick={() => setOpen(!open)}>
            {open ? <FiX size={22} className="text-white" /> : <FiMenu size={22} className="text-white" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-gradient-to-b from-[#3d6b35] to-[#6b4226] border-t border-white/10 px-6 py-4 flex flex-col gap-4 text-sm text-green-100">
          <Link to="/" onClick={() => setOpen(false)} className="hover:text-white">Home</Link>
          <Link to="/products" onClick={() => setOpen(false)} className="hover:text-white">Products</Link>
          <Link to="/cart" onClick={() => setOpen(false)} className="hover:text-white">Cart ({count})</Link>
          {user ? (
            <>
              <Link to="/orders" onClick={() => setOpen(false)} className="hover:text-white">My Orders</Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-1 text-yellow-300 font-bold">
                  <FiSettings size={13} /> Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="text-red-300 text-left">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="text-white font-bold">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
