import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Valid email required';
  if (form.password.length < 8) errors.password = 'Minimum 8 characters';
  else if (!/[A-Z]/.test(form.password)) errors.password = 'Must contain an uppercase letter';
  else if (!/[0-9]/.test(form.password)) errors.password = 'Must contain a number';
  else if (!/[!@#$%^&*]/.test(form.password)) errors.password = 'Must contain a special character (!@#$%^&*)';
  if (form.password !== form.confirm) errors.confirm = 'Passwords do not match';
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Ashwin Dates" className="h-16 w-16 object-contain mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Create Account</h1>
          <p className="text-gray-500 text-sm">Join Ashwin Dates & Dry Fruits</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 8 chars, uppercase, number, special' },
            { name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input
                name={f.name} type={f.type} value={form[f.name]} onChange={handleChange}
                placeholder={f.placeholder}
                className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-300 ${errors[f.name] ? 'border-red-400' : ''}`}
              />
              {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]}</p>}
            </div>
          ))}
          <button
            type="submit" disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

