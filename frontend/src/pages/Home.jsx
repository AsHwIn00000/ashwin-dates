import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const categories = [
  { name: 'Dates',             value: 'dates',   color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { name: 'Dry Fruits',        value: 'almonds',  color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' },
  { name: 'Spices',            value: 'spices',   color: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800' },
  { name: 'Combos',            value: 'combo',    color: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' },
  { name: 'Seeds',             value: 'seeds',    color: 'bg-lime-50 dark:bg-lime-900/20 text-lime-800 dark:text-lime-300 border-lime-200 dark:border-lime-800' },
  { name: 'Flavoured Essence', value: 'essence',  color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/featured')
      .then(r => setFeatured(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero — green to brown ombre */}
      <section className="bg-gradient-to-br from-[#3d6b35] via-[#5a5228] to-[#6b4226] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-5 leading-tight tracking-tight">
            Ashwin Dates &<br />
            <span className="text-yellow-200">Dry Fruits</span>
          </h1>
          <p className="text-lg text-green-100 mb-10 max-w-xl mx-auto">
            Handpicked dates, dry fruits, spices, seeds & flavoured essence — delivered fresh to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="bg-white font-bold px-10 py-3.5 rounded-full hover:bg-green-50 transition text-base text-[#3d6b35]">
              Shop Now
            </Link>
            <Link to="/products?category=dates" className="border border-white/40 text-white font-semibold px-10 py-3.5 rounded-full hover:bg-white/10 transition text-base">
              View Dates
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Shop by Category</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Explore our wide range of natural products</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.value}
              to={`/products?category=${cat.value}`}
              className={`${cat.color} border rounded-2xl px-4 py-5 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform duration-200 text-center`}
            >
              <span className="font-semibold text-sm leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Featured Products</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Our most loved picks</p>
        </div>
        {loading ? <Spinner /> : (
          featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-16">
              <p className="text-5xl mb-4">🌴</p>
              <p>No featured products yet.</p>
              <Link to="/products" className="underline mt-2 inline-block text-[#3d6b35] dark:text-green-400">
                Browse all products
              </Link>
            </div>
          )
        )}
        <div className="text-center mt-12">
          <Link to="/products" className="bg-gradient-to-r from-[#3d6b35] to-[#6b4226] text-white px-10 py-3.5 rounded-full font-semibold hover:opacity-80 transition">
            View All Products
          </Link>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-t border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹500' },
            { icon: '✅', title: '100% Natural', desc: 'No preservatives, no additives' },
            { icon: '🔒', title: 'Secure Payment', desc: 'Razorpay & COD available' },
          ].map(f => (
            <div key={f.title}>
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
