import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#3d6b35] to-[#6b4226] text-green-100 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo.png" alt="Ashwin Dates" className="h-10 w-10 object-contain rounded-full bg-white/10" />
            <div>
              <span className="text-base font-extrabold text-white">Ashwin</span>
              <span className="block text-xs text-green-200 -mt-0.5">Dates & Dry Fruits</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-green-200">
            Premium quality dates, dry fruits, spices, seeds & flavoured essence delivered to your doorstep.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
            <li><Link to="/products" className="hover:text-white transition">Products</Link></li>
            <li><Link to="/cart" className="hover:text-white transition">Cart</Link></li>
            <li><Link to="/orders" className="hover:text-white transition">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
          <p className="text-sm">📍 438/Main Bazaar, Virudhunagar - 626001</p>
          <p className="text-sm mt-2">📧 preamkumar.t.m1978@gmail.com</p>
          <p className="text-sm mt-2">📞 +91 9442114559</p>
          <p className="text-sm mt-3 text-green-300">Free shipping on orders above ₹500</p>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-5 text-xs text-green-300">
        © {new Date().getFullYear()} Ashwin Dates & Dry Fruits. All rights reserved.
      </div>
    </footer>
  );
}
