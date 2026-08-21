import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { FiTruck, FiShield, FiCheckCircle, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const categories = [
  { name: 'Premium Dates', value: 'dates', gradient: 'from-amber-500 to-orange-600', count: '12 Items' },
  { name: 'Nutritious Dry Fruits', value: 'almonds', gradient: 'from-yellow-500 to-amber-600', count: '18 Items' },
  { name: 'Aromatic Spices', value: 'spices', gradient: 'from-red-500 to-rose-600', count: '8 Items' },
  { name: 'Value Combos', value: 'combo', gradient: 'from-emerald-500 to-teal-600', count: '5 Items' },
  { name: 'Healthy Seeds', value: 'seeds', gradient: 'from-lime-500 to-emerald-600', count: '10 Items' },
  { name: 'Flavoured Essence', value: 'essence', gradient: 'from-orange-500 to-red-600', count: '6 Items' },
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
    <div className="overflow-x-hidden bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-100">
      
      {/* Premium Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-tr from-[#3F6A35] via-[#5A582E] to-[#6B4327] text-white py-20 px-6 overflow-hidden">
        
        {/* Animated Background Glowing Orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="relative max-w-5xl mx-auto text-center z-10 flex flex-col items-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-yellow-200 mb-6 hover:scale-105 transition-all duration-300 cursor-default">
            <FiCheckCircle className="animate-spin text-emerald-400" style={{ animationDuration: '6s' }} /> 100% Handpicked & Natural
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight text-white">
            Ashwin Dates & <br />
            <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-emerald-300 bg-clip-text text-transparent filter drop-shadow">
              Dry Fruits
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-100 mb-10 max-w-xl mx-auto leading-relaxed opacity-90">
            Discover a premium collection of organic dates, energy-rich dry fruits, raw seeds, and exotic spices delivered straight to your home.
          </p>
          
          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <Link 
              to="/products" 
              className="group bg-white text-[#3F6A35] font-bold px-10 py-4 rounded-full shadow-xl hover:shadow-white/10 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Shop Collection <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/products?category=dates" 
              className="border border-white/30 bg-white/5 backdrop-blur-md text-white font-semibold px-10 py-4 rounded-full hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
            >
              Explore Premium Dates
            </Link>
          </div>
        </div>
      </section>

      {/* Modernized Categories Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-[#3F6A35] dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Our Range</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mt-1">Shop by Category</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Finest selected categories for your daily nutrition</p>
          </div>
          <Link 
            to="/products" 
            className="group flex items-center gap-1.5 text-sm font-bold text-[#3F6A35] dark:text-emerald-400 hover:text-[#6B4327] mt-4 md:mt-0"
          >
            Browse all categories <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.value}
              to={`/products?category=${cat.value}`}
              className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-2 active:scale-95 transition-all duration-300"
            >
              {/* Dynamic Gradient Circle */}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md transform group-hover:rotate-6 transition duration-300`}>
                {cat.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight group-hover:text-[#3F6A35] dark:group-hover:text-emerald-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-white dark:bg-gray-950 py-20 border-t border-b border-gray-100 dark:border-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[#3F6A35] dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Top Sellers</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mt-1">Featured Products</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loved by our premium customers</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : (
            featured.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {featured.map(p => (
                  <div key={p._id} className="hover:-translate-y-2 hover:shadow-xl active:scale-[0.99] transition-all duration-300">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-16">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 mx-auto mb-4">
                  <FiShoppingBag size={24} />
                </div>
                <p className="font-bold text-gray-900 dark:text-white">No products featured yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-6">We are replenishing our fresh stock shortly.</p>
                <Link to="/products" className="bg-gradient-to-r from-[#3F6A35] to-[#6B4327] text-white font-bold px-8 py-3 rounded-full shadow transition inline-flex items-center gap-2">
                  Browse Store Catalog <FiArrowRight />
                </Link>
              </div>
            )
          )}

          {featured.length > 0 && (
            <div className="text-center mt-16">
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#3F6A35] via-[#5A582E] to-[#6B4327] hover:opacity-95 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-gray-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all duration-300"
              >
                View Full Catalog <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Modern features list - Emojis removed, replaced by beautiful animated icons */}
      <section className="bg-gray-50 dark:bg-black py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: <FiTruck className="text-[#3F6A35] dark:text-emerald-400" size={32} />, 
              title: 'Express Courier Shipping', 
              desc: 'Completely free delivery on all order checkouts above ₹500 across India.' 
            },
            { 
              icon: <FiCheckCircle className="text-[#5A582E] dark:text-yellow-400" size={32} />, 
              title: '100% Organic & Clean', 
              desc: 'Direct source quality without chemical preservatives, artificial elements or sugar syrups.' 
            },
            { 
              icon: <FiShield className="text-[#6B4327] dark:text-[#5A582E]" size={32} />, 
              title: 'Secure Checkout Network', 
              desc: 'Encrypted online transaction network with Razorpay payments and Cash on Delivery.' 
            },
          ].map((f, i) => (
            <div 
              key={f.title}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-3xl text-center flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                {f.icon}
              </div>
              <h3 className="font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight text-lg">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
