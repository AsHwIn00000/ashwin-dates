import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { FiUsers, FiShoppingBag, FiPackage, FiDollarSign } from 'react-icons/fi';

const BRAND = '#3d6b35';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;

  const cards = [
    { label: 'Total Users', value: stats?.users, icon: <FiUsers size={22} />, },
    { label: 'Total Orders', value: stats?.orders, icon: <FiShoppingBag size={22} />, },
    { label: 'Products', value: stats?.products, icon: <FiPackage size={22} />, },
    { label: 'Revenue', value: `₹${stats?.revenue?.toLocaleString('en-IN') || 0}`, icon: <FiDollarSign size={22} />, },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="rounded-2xl text-white p-6 mb-8" className="bg-gradient-to-r from-[#3d6b35] to-[#6b4226]">
        <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
        <p className="text-purple-200 text-sm mt-1">Manage your store — products, orders, and customers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 flex items-center gap-4 border border-gray-100 dark:border-gray-800">
            <div className="text-white p-3 rounded-xl" className="bg-gradient-to-r from-[#3d6b35] to-[#6b4226]">{c.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{c.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/admin/products', label: 'Manage Products', icon: '📦', desc: 'Add, edit, delete products — changes show instantly to customers' },
          { to: '/admin/orders', label: 'Manage Orders', icon: '🛒', desc: 'View all orders and update their status' },
          { to: '/admin/users', label: 'View Users', icon: '👥', desc: 'See all registered customers' },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 hover:shadow-md transition hover:-translate-y-1 border border-gray-100 dark:border-gray-800 group"
          >
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="font-bold text-gray-800 dark:text-white mb-1 group-hover:text-[#3d6b35]">{item.label}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}


