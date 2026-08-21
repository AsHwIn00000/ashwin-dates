import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiKey, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

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
  const { register, verifyRegisterOtp, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Mode: 'register-form' | 'verify-otp'
  const [mode, setMode] = useState('register-form');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    otp: '',
  });

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
      const res = await register(form.name, form.email, form.password);
      if (res.status === 'PENDING_VERIFICATION') {
        toast.success(res.message || 'OTP code generated!');
        setMode('verify-otp');
      } else {
        toast.success('Registration successful!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async e => {
    e.preventDefault();
    if (!form.otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }
    setLoading(true);
    try {
      const user = await verifyRegisterOtp(form.email, form.otp);
      toast.success(`Welcome to Ashwin Dates, ${user.name}! Your account is verified.`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    try {
      const user = await googleLogin(response.credential);
      toast.success(`Successfully registered with Google as ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: '245597680903-q9am6t8i1uh0guu6j6i5e37djsocabm6.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signup-btn'),
          { theme: 'outline', size: 'large', width: '380', shape: 'pill' }
        );
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initGoogle();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#3F6A35]/15 via-[#5A582E]/5 to-[#6B4327]/15 flex items-center justify-center px-4 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-[#3F6A35]/10 dark:border-[#5A582E]/20 rounded-3xl shadow-2xl p-8 w-full max-w-md transition-all duration-500 hover:shadow-[#3F6A35]/10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Ashwin Dates Logo" className="h-16 w-16 object-contain mx-auto mb-4 hover:scale-105 transition-transform duration-300" />
          <h1 className="text-2xl font-black text-[#3F6A35] dark:text-emerald-400 tracking-tight">
            {mode === 'verify-otp' ? 'Verify Account' : 'Create Account'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 font-medium">
            {mode === 'verify-otp' ? 'Enter the verification OTP code' : 'Join Ashwin Dates & Dry Fruits'}
          </p>
        </div>



        {/* 1. REGISTRATION FORM VIEW */}
        {mode === 'register-form' && (
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiUser size={16} />
                  </div>
                  <input
                    name="name" type="text" value={form.name} onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F6A35] focus:bg-white dark:focus:bg-gray-800 transition-all ${
                      errors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.name}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiMail size={16} />
                  </div>
                  <input
                    name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="you@domain.com"
                    className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F6A35] focus:bg-white dark:focus:bg-gray-800 transition-all ${
                      errors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiLock size={16} />
                  </div>
                  <input
                    name="password" type="password" value={form.password} onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F6A35] focus:bg-white dark:focus:bg-gray-800 transition-all ${
                      errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                </div>
                {errors.password && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiLock size={16} />
                  </div>
                  <input
                    name="confirm" type="password" value={form.confirm} onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F6A35] focus:bg-white dark:focus:bg-gray-800 transition-all ${
                      errors.confirm ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                </div>
                {errors.confirm && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.confirm}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-[#3F6A35] via-[#5A582E] to-[#6B4327] hover:opacity-95 text-white py-3.5 rounded-2xl font-bold shadow-md shadow-[#3F6A35]/15 transition-all active:scale-[0.98] disabled:opacity-60 flex justify-center items-center text-sm tracking-wide mt-2"
              >
                {loading ? 'SENDING OTP...' : 'REGISTER & VERIFY'}
              </button>
            </form>

            {/* Separator line */}
            <div className="relative flex items-center justify-center my-4">
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
              <span className="flex-shrink mx-4 text-[11px] text-gray-400 font-bold uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
            </div>

            {/* Google Signup Button */}
            <div className="relative w-full overflow-hidden rounded-2xl mt-2">
              {/* Visual Custom Button */}
              <button
                type="button"
                className="w-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 py-3.5 rounded-2xl font-bold text-sm text-gray-700 dark:text-gray-300 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                <FcGoogle size={20} />
                Sign up with Google
              </button>
              {/* Invisible Google Button Overlay */}
              <div 
                id="google-signup-btn" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:scale-150"
              ></div>
            </div>
          </div>
        )}

        {/* 2. OTP VERIFICATION VIEW */}
        {mode === 'verify-otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed mb-4">
              <FiCheckCircle size={22} className="shrink-0 text-emerald-500" />
              <div>
                We have dispatched a verification code to <strong className="text-emerald-900 dark:text-emerald-200">{form.email}</strong>. Please input the OTP code below.
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-widest mb-1.5">6-Digit Registration OTP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiKey size={16} />
                </div>
                <input
                  name="otp" type="text" maxLength={6} value={form.otp} onChange={handleChange}
                  placeholder="123456"
                  className={`w-full font-mono text-center tracking-[8px] bg-gray-50/50 dark:bg-gray-800/50 border rounded-2xl pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#3F6A35] focus:bg-white dark:focus:bg-gray-800 transition-all ${
                    errors.otp ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
              {errors.otp && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.otp}</p>}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode('register-form')}
                className="flex-[2] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
              >
                Back
              </button>
              <button
                type="submit" disabled={loading}
                className="flex-[3] bg-gradient-to-r from-[#3F6A35] to-[#6B4327] hover:opacity-95 text-white py-3 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-60 flex justify-center items-center text-xs tracking-wider"
              >
                {loading ? 'VERIFYING...' : 'VERIFY & SIGN UP'}
              </button>
            </div>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs font-semibold">
          <p className="text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#3F6A35] dark:text-emerald-400 hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
