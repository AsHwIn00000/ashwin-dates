import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiKey, FiArrowLeft, FiCheckCircle, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

// mode: 'email' → enter email
//       'otp'   → new user: verify OTP to activate account
//       'password' → existing user: enter password
//       'forgot-send' → forgot password email step
//       'forgot-verify' → forgot password OTP + new password step

export default function Login() {
  const { login, checkEmail, sendOtp, verifyRegisterOtp, googleLogin, resetPasswordWithOtp } = useAuth();
  const navigate = useNavigate();

  // Keep a stable ref to the Google callback so the closure is never stale
  const googleCallbackRef = useRef(null);

  const [mode, setMode] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    email: '',
    password: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  // ── Step 1: Check email ──────────────────────────────────────────────────
  const handleEmailSubmit = async e => {
    e.preventDefault();
    if (!form.email) { setErrors({ email: 'Email is required' }); return; }

    setLoading(true);
    try {
      const res = await checkEmail(form.email);
      if (res.status === 'EXISTING_USER') {
        setMode('password');
      } else {
        // NEW_USER — OTP sent
        toast.success(res.message || 'OTP sent to your email!');
        if (res.otp) setForm(f => ({ ...f, otp: res.otp })); // simulated mode
        setMode('otp');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2a: New user OTP verify ─────────────────────────────────────────
  const handleOtpVerify = async e => {
    e.preventDefault();
    if (!form.otp) { setErrors({ otp: 'OTP is required' }); return; }

    setLoading(true);
    try {
      const user = await verifyRegisterOtp(form.email, form.otp);
      toast.success(`Welcome to Ashwin Dates, ${user.name}! 🎉`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2b: Existing user password login ───────────────────────────────
  const handlePasswordLogin = async e => {
    e.preventDefault();
    if (!form.password) { setErrors({ password: 'Password is required' }); return; }

    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (res.status === 'PENDING_VERIFICATION') {
        toast.error('Account not verified. A new OTP has been sent!');
        setMode('otp');
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

  // ── Forgot password: step 1 send OTP ────────────────────────────────────
  const handleForgotSend = async e => {
    e.preventDefault();
    if (!form.email) { setErrors({ email: 'Email is required' }); return; }

    setLoading(true);
    try {
      const res = await sendOtp(form.email, 'forgot-password');
      toast.success(res.message || 'Reset OTP sent!');
      if (res.otp) setForm(f => ({ ...f, otp: res.otp }));
      setMode('forgot-verify');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending reset OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password: step 2 reset ───────────────────────────────────────
  const handleResetPassword = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.otp) errs.otp = 'OTP is required';
    if (form.newPassword.length < 6) errs.newPassword = 'Min 6 characters';
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await resetPasswordWithOtp(form.email, form.otp, form.newPassword);
      toast.success(res.message || 'Password reset! Please sign in.');
      setForm(f => ({ ...f, password: '', otp: '', newPassword: '', confirmPassword: '' }));
      setMode('password');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ─────────────────────────────────────────────────────────
  // Store callback in ref so the SDK always calls the latest version
  googleCallbackRef.current = async (response) => {
    setLoading(true);
    try {
      const user = await googleLogin(response.credential);
      toast.success(`Signed in as ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google SDK once on mount
  useEffect(() => {
    const GOOGLE_CLIENT_ID = '245597680903-q9am6t8i1uh0guu6j6i5e37djsocabm6.apps.googleusercontent.com';

    const initGoogle = () => {
      if (!window.google?.accounts) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        // Route through ref so closure is never stale
        callback: (response) => googleCallbackRef.current(response),
        cancel_on_tap_outside: false,
      });
    };

    if (window.google?.accounts) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts) {
          initGoogle();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // Trigger Google One Tap / sign-in popup when user clicks our custom button
  const handleGoogleButtonClick = () => {
    if (!window.google?.accounts) {
      toast.error('Google Sign-In is still loading, please try again.');
      return;
    }
    window.google.accounts.id.prompt((notification) => {
      // If One Tap was suppressed (browser policy / user dismissed before),
      // fall back to the OAuth popup flow
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const clientId = '245597680903-q9am6t8i1uh0guu6j6i5e37djsocabm6.apps.googleusercontent.com';
        const origin = window.location.origin;
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: `${origin}/login`,
          response_type: 'token',
          scope: 'email profile',
          prompt: 'select_account',
        });
        // Use auth code flow via a popup window
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              toast.error('Google Sign-In was cancelled.');
              return;
            }
            // Fetch user info with the access token
            try {
              setLoading(true);
              const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              }).then(r => r.json());
              // We need the id_token — fall back to telling user to try again
              toast.error('Please try signing in with Google again or use email.');
            } catch {
              toast.error('Google Sign-In failed. Please try with email.');
            } finally {
              setLoading(false);
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      }
    });
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const inputCls = (field) =>
    `w-full bg-gray-50/50 dark:bg-gray-800/50 border rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F6A35] focus:bg-white dark:focus:bg-gray-800 transition-all ${
      errors[field] ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700'
    }`;

  const primaryBtn = `w-full bg-gradient-to-r from-[#3F6A35] via-[#5A582E] to-[#6B4327] hover:opacity-95 text-white py-3.5 rounded-2xl font-bold shadow-md shadow-[#3F6A35]/15 transition-all active:scale-[0.98] disabled:opacity-60 flex justify-center items-center text-sm tracking-wide gap-2`;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#3F6A35]/15 via-[#5A582E]/5 to-[#6B4327]/15 flex items-center justify-center px-4 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-[#3F6A35]/10 dark:border-[#5A582E]/20 rounded-3xl shadow-2xl p-8 w-full max-w-md transition-all duration-500">

        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Ashwin Dates Logo" className="h-16 w-16 object-contain mx-auto mb-4 hover:scale-105 transition-transform duration-300" />
          <h1 className="text-2xl font-black text-[#3F6A35] dark:text-emerald-400 tracking-tight">
            {mode === 'email' && 'Sign In'}
            {mode === 'otp' && 'Verify Your Email'}
            {mode === 'password' && 'Welcome Back'}
            {mode === 'forgot-send' && 'Reset Password'}
            {mode === 'forgot-verify' && 'Create New Password'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 font-medium">
            {mode === 'email' && 'Enter your email to get started'}
            {mode === 'otp' && `OTP sent to ${form.email}`}
            {mode === 'password' && `Signing in as ${form.email}`}
            {mode === 'forgot-send' && 'We\'ll email you a reset code'}
            {mode === 'forgot-verify' && 'Enter the OTP and your new password'}
          </p>
        </div>

        {/* ── 1. EMAIL STEP ── */}
        {mode === 'email' && (
          <div className="space-y-5">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiMail size={16} />
                  </div>
                  <input
                    id="email-input"
                    name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="name@domain.com" autoFocus
                    className={inputCls('email')}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.email}</p>}
              </div>

              <button type="submit" disabled={loading} className={primaryBtn}>
                {loading ? 'Checking...' : <><span>Continue</span><FiArrowRight size={16} /></>}
              </button>
            </form>

            {/* Separator */}
            <div className="relative flex items-center justify-center my-2">
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800" />
              <span className="flex-shrink mx-4 text-[11px] text-gray-400 font-bold uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800" />
            </div>

            {/* Google Button — calls prompt() directly, no iframe overlay needed */}
            <button
              type="button"
              id="google-signin-btn"
              onClick={handleGoogleButtonClick}
              disabled={loading}
              className="w-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 py-3.5 rounded-2xl font-bold text-sm text-gray-700 dark:text-gray-300 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-60"
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 pt-1">
              New here? Just enter your email — we'll set you up automatically ✨
            </p>
          </div>
        )}

        {/* ── 2. OTP STEP (new user verification) ── */}
        {mode === 'otp' && (
          <form onSubmit={handleOtpVerify} className="space-y-5">
            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
              <FiCheckCircle size={22} className="shrink-0 text-emerald-500" />
              <div>
                We sent a 6-digit verification code to <strong className="text-emerald-900 dark:text-emerald-200">{form.email}</strong>. Enter it below to sign in.
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-widest mb-1.5">6-Digit OTP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiKey size={16} />
                </div>
                <input
                  id="otp-input"
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
                onClick={() => setMode('email')}
                className="flex-[2] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
              >
                <FiArrowLeft size={14} className="inline mr-1" /> Back
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

        {/* ── 3. PASSWORD STEP (existing user) ── */}
        {mode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-5">
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
                  id="password-input"
                  name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange}
                  placeholder="••••••••" autoFocus
                  className={`w-full bg-gray-50/50 dark:bg-gray-800/50 border rounded-2xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F6A35] focus:bg-white dark:focus:bg-gray-800 transition-all ${
                    errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.password}</p>}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode('email')}
                className="flex-[2] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
              >
                <FiArrowLeft size={14} className="inline mr-1" /> Back
              </button>
              <button
                type="submit" disabled={loading}
                className="flex-[3] bg-gradient-to-r from-[#3F6A35] via-[#5A582E] to-[#6B4327] hover:opacity-95 text-white py-3 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-60 flex justify-center items-center text-xs tracking-wider"
              >
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </div>
          </form>
        )}

        {/* ── 4. FORGOT PASSWORD - SEND OTP ── */}
        {mode === 'forgot-send' && (
          <form onSubmit={handleForgotSend} className="space-y-5">
            <div className="flex items-center gap-2 text-[#3F6A35] dark:text-emerald-400 font-bold mb-4">
              <button type="button" onClick={() => setMode('password')} className="hover:opacity-75">
                <FiArrowLeft size={18} />
              </button>
              <span className="text-base font-black">Reset Password</span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed -mt-2">
              Enter your email address and we'll send you an OTP to reset your password.
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
                  className={inputCls('email')}
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.email}</p>}
            </div>

            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? 'SENDING CODE...' : 'SEND RESET CODE'}
            </button>
          </form>
        )}

        {/* ── 5. FORGOT PASSWORD - VERIFY & RESET ── */}
        {mode === 'forgot-verify' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="flex items-center gap-2 text-[#3F6A35] dark:text-emerald-400 font-bold mb-2">
              <button type="button" onClick={() => setMode('forgot-send')} className="hover:opacity-75">
                <FiArrowLeft size={18} />
              </button>
              <span className="text-base font-black">Create New Password</span>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
              OTP dispatched to <strong>{form.email}</strong>. Enter the code and your new password below.
            </div>

            {/* OTP */}
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

            {/* New Password */}
            <div>
              <label className="block text-[10px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-widest mb-1.5">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiLock size={16} />
                </div>
                <input
                  name="newPassword" type="password" value={form.newPassword} onChange={handleChange}
                  placeholder="Min 6 characters"
                  className={inputCls('newPassword')}
                />
              </div>
              {errors.newPassword && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold text-[#6B4327] dark:text-amber-400 uppercase tracking-widest mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiLock size={16} />
                </div>
                <input
                  name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                  placeholder="Repeat new password"
                  className={inputCls('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? 'UPDATING...' : 'RESET PASSWORD'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
