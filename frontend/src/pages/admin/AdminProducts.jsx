import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

const CATEGORIES = ['dates', 'almonds', 'cashews', 'pistachios', 'combo', 'spices', 'seeds', 'essence', 'others'];
const WEIGHTS = [
  { label: '100g', ratio: 0.1 },
  { label: '250g', ratio: 0.25 },
  { label: '500g', ratio: 0.5 },
  { label: '1kg',  ratio: 1 },
];
const EMPTY = { name: '', description: '', pricePerKg: '', category: 'dates', inStock: true, isFeatured: false };

const calcPrices = (pkgVal) => {
  const pkg = Number(pkgVal);
  if (!pkg || pkg <= 0) return null;
  return WEIGHTS.reduce((acc, w) => ({ ...acc, [w.label]: Math.round(pkg * w.ratio) }), {});
};

const inputCls = "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-gray-800 dark:text-white";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products?limit=200').then(r => setProducts(r.data.products)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setFiles([]); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({ name: p.name, description: p.description, pricePerKg: p.pricePerKg, category: p.category, inStock: p.inStock, isFeatured: p.isFeatured || false });
    setFiles([]);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.pricePerKg || Number(form.pricePerKg) <= 0) { toast.error('Enter a valid price per kg'); return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('pricePerKg', form.pricePerKg);
      fd.append('category', form.category);
      fd.append('inStock', form.inStock);
      fd.append('isFeatured', form.isFeatured);
      files.forEach(f => fd.append('images', f));
      if (editing) {
        await api.put(`/products/${editing}`, fd);
        toast.success('Product updated!');
      } else {
        await api.post('/products', fd);
        toast.success('Product added!');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const preview = calcPrices(form.pricePerKg);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm"
        >
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-t-2xl border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                {editing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Premium Medjool Dates" className={inputCls} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputCls}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c === 'essence' ? 'Flavoured Essence' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Price per Kg (₹) * <span className="text-gray-400 font-normal">— other weights auto-calculated</span>
                </label>
                <input type="number" min="1" value={form.pricePerKg}
                  onChange={e => setForm(p => ({ ...p, pricePerKg: e.target.value }))}
                  placeholder="e.g. 1200" className={inputCls} />
                {preview && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {WEIGHTS.map(w => (
                      <div key={w.label} className="text-center bg-green-50 dark:bg-green-900/10 rounded-lg py-2 border border-green-100 dark:border-green-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{w.label}</p>
                        <p className="text-sm font-bold text-green-700 dark:text-green-400">₹{preview[w.label]}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="Describe the product — quality, origin, benefits..."
                  className={inputCls + " resize-none"} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Product Images (max 5)</label>
                <input type="file" multiple accept="image/jpeg,image/png,image/webp"
                  onChange={e => setFiles(Array.from(e.target.files).slice(0, 5))}
                  className="w-full text-sm text-gray-500 dark:text-gray-400" />
                {files.length > 0 && <p className="text-xs text-green-600 mt-1">{files.length} image(s) selected</p>}
                {editing && <p className="text-xs text-gray-400 mt-1">Leave empty to keep existing images</p>}
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm(p => ({ ...p, inStock: !p.inStock }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${form.inStock ? 'bg-green-500' : 'bg-red-400'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.inStock ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{form.inStock ? '✅ In Stock' : '❌ Out of Stock'}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm(p => ({ ...p, isFeatured: !p.isFeatured }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${form.isFeatured ? 'bg-green-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show on Homepage</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition">
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-100 dark:border-gray-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#3d6b35] to-[#6b4226] text-white text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Per Kg</th>
                <th className="px-4 py-3 text-left">100g / 250g / 500g</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Featured</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                          : <span className="text-base">🌴</span>}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1 max-w-[140px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-500 dark:text-gray-400">{p.category}</td>
                  <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-400">₹{p.pricePerKg}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                    ₹{p.prices?.['100g']} / ₹{p.prices?.['250g']} / ₹{p.prices?.['500g']}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.isFeatured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isFeatured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Edit">
                        <FiEdit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(p._id, p.name)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition" title="Delete">
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p>No products yet. Click "Add Product" to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
