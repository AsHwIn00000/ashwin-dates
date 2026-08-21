import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiKey, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const { login, sendOtp, verifyRegisterOtp, googleLogin, resetPasswordWithOtp } = useAuth();
  const navigate = useNavigate();

  // Mode: 'password' | 'login-verify' (for unverified users logging in) | 'forgot-send' | 'forgot-verify'
  const [mode, setMode] = useState('password');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  
  const [form, setForm] = useState({
    email: '',
    password: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  // Submit Password Login
  const handlePasswordSubmit = async e => {
    e.preventDefault();
    if (!form.email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!form.password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (res.status === 'PENDING_VERIFICATION') {
        toast.error(res.message || 'Account not verified. Verification OTP sent!');
        setMode('login-verify');
      } else {
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate(res.user.role === 'admin' ? '/admin' : '/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Verify registration OTP (for unverified users logging in)
  const handleVerifyRegisterOtp = async e => {
    e.preventDefault();
    if (!form.otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }

    setLoading(true);
    try {
      const user = await verifyRegisterOtp(form.email, form.otp);
      toast.success(`Welcome back, ${user.name}! Your account is verified.`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send Reset Password OTP
  const handleSendForgotPasswordOtp = async e => {
    e.preventDefault();
    if (!form.email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(form.email, 'forgot-password');
      toast.success(res.message || 'Verification OTP sent to your email!');
      setMode('forgot-verify');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error requesting password reset');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.otp) errs.otp = 'OTP is required';
    if (form.newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordWithOtp(form.email, form.otp, form.newPassword);
      toast.success(res.message || 'Password reset successfully!');
      setForm(prev => ({ ...prev, password: '', otp: '', newPassword: '', confirmPassword: '' }));
      setMode('password');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    try {
      const user = await googleLogin(response.credential);
      toast.success(`Successfully authenticated with Google as ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Google Sign-In failed');
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
          document.getElementById('google-signin-btn'),
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
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Ashwin Dates Logo" className="h-16 w-16 object-contain mx-auto mb-4 hover:scale-105 transition-transform duration-300" />
          <h1 className="text-2xl font-black text-[#3F6A35] dark:text-emerald-400 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 font-medium">
            Sign in to Ashwin Dates & Dry Fruits
          </p>
        </div>



        {/* 1. PASSWORD LOGIN FORM */}
        {mode === 'password' && (
          <div className="space-y-5">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiMail size={16} />
                  </div>
                  <input
                    name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="name@domain.com"
                    className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F6A35] focus:bg-white dark:focus:bg-gray-800 transition-all ${
                      errors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.email}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot-send'); setErrors({}); }}
                    className="text-[11px] text-[#3F6A35] dark:text-emerald-400 hover:underline font-bold"
                  >
                    Forgot Password?
                  </button>
                </div>
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

              <button
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-[#3F6A35] via-[#5A582E] to-[#6B4327] hover:opacity-95 text-white py-3.5 rounded-2xl font-bold shadow-md shadow-[#3F6A35]/15 transition-all active:scale-[0.98] disabled:opacity-60 flex justify-center items-center text-sm tracking-wide"
              >
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </form>

            {/* Separator line */}
            <div className="relative flex items-center justify-center my-4">
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
              <span className="flex-shrink mx-4 text-[11px] text-gray-400 font-bold uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
            </div>

            {/* Google Login Button */}
            <div className="relative w-full overflow-hidden rounded-2xl mt-2">
              {/* Visual Custom Button */}
              <button
                type="button"
                className="w-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 py-3.5 rounded-2xl font-bold text-sm text-gray-700 dark:text-gray-300 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                <FcGoogle size={20} />
                Continue with Google
              </button>
              {/* Invisible Google Button Overlay */}
              <div 
                id="google-signin-btn" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:scale-150"
              ></div>
            </div>
          </div>
        )}

        {/* 2. UNVERIFIED LOGIN OTP INTERCEPTION VIEW */}
        {mode === 'login-verify' && (
          <form onSubmit={handleVerifyRegisterOtp} className="space-y-5">
            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed mb-2">
              <FiCheckCircle size={22} className="shrink-0 text-emerald-500" />
              <div>
                Please enter the verification OTP code sent to <strong className="text-emerald-900 dark:text-emerald-200">{form.email}</strong>.
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-widest mb-1.5">6-Digit Verification OTP</label>
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
                onClick={() => setMode('password')}
                className="flex-[2] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
              >
                Back
              </button>
              <button
                type="submit" disabled={loading}
                className="flex-[3] bg-gradient-to-r from-[#3F6A35] to-[#6B4327] hover:opacity-95 text-white py-3 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-60 flex justify-center items-center text-xs tracking-wider"
              >
                {loading ? 'VERIFYING...' : 'VERIFY & SIGN IN'}
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD - REQUEST OTP */}
        {mode === 'forgot-send' && (
          <form onSubmit={handleSendForgotPasswordOtp} className="space-y-5">
            <div className="flex items-center gap-2 text-[#3F6A35] dark:text-emerald-400 font-bold mb-4">
              <button type="button" onClick={() => setMode('password')} className="hover:opacity-75">
                <FiArrowLeft size={18} />
              </button>
              <span className="text-base font-black">Reset Password</span>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              Enter your email address and we'll send you an OTP code to let you securely update your password.
            </p>

            <div>
              <label className="block text-[10px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-widest mb-1.5">Registered Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiMail size={16} />
                </div>
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="name@domain.com"
                  className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#3F6A35] focus:bg-white dark:focus:bg-gray-800 transition-all ${
                    errors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.email}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-[#3F6A35] via-[#5A582E] to-[#6B4327] hover:opacity-95 text-white py-3.5 rounded-2xl font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-60 flex justify-center items-center text-xs tracking-wider"
            >
              {loading ? 'SENDING CODE...' : 'SEND RESET CODE'}
            </button>
          </form>
        )}

        {/* 4. FORGOT PASSWORD - VERIFY & RESET */}
        {mode === 'forgot-verify' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="flex items-center gap-2 text-[#3F6A35] dark:text-emerald-400 font-bold mb-2">
              <button type="button" onClick={() => setMode('forgot-send')} className="hover:opacity-75">
                <FiArrowLeft size={18} />
              </button>
              <span className="text-base font-black">Create New Password</span>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed mb-2">
              OTP has been dispatched. Enter the code along with your new password details below.
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-widest mb-1.5">6-Digit OTP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiKey size={16} />
                </div>
                <input
                  name="otp" type="text" maxLength={6} value={form.otp} onChange={handleChange}
                  placeholder="123456"
                  className={`w-full font-mono text-center tracking-[8px] bg-gray-50/50 dark:bg-gray-800/50 border rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#3F6A35] focus:bg-white dark:focus:bg-gray-800 transition-all ${
                    errors.otp ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
              {errors.otp && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.otp}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-widest mb-1.5">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiLock size={16} />
                </div>
                <input
                  name="newPassword" type="password" value={form.newPassword} onChange={handleChange}
                  placeholder="Min 8 characters"
                  className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#3F6A35] focus:bg-white dark:focus:bg-gray-800 transition-all ${
                    errors.newPassword ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
              {errors.newPassword && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-widest mb-1.5">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiLock size={16} />
                </div>
                <input
                  name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                  placeholder="Repeat new password"
                  className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#3F6A35] focus:bg-white dark:focus:bg-gray-800 transition-all ${
                    errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-[#3F6A35] via-[#5A582E] to-[#6B4327] hover:opacity-95 text-white py-3.5 rounded-2xl font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-60 flex justify-center items-center text-xs tracking-wider"
            >
              {loading ? 'UPDATING...' : 'RESET PASSWORD'}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs font-semibold">
          <p className="text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#3F6A35] dark:text-emerald-400 hover:underline font-bold">
              Register
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
