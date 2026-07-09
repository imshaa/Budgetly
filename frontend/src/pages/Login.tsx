import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, profileAPI } from '../services/api';

type Screen = 'auth' | 'otp-verify' | 'forgot-password' | 'forgot-otp' | 'reset-password';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [screen, setScreen] = useState<Screen>('auth');
  const navigate = useNavigate();
  const { login, signup, verifyEmail } = useAuth();

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMessages = () => { setError(''); setSuccessMsg(''); };

  // ── OTP input helpers ──────────────────────────────────────────────────────
  const handleOtpChange = (
    index: number,
    value: string,
    otpArr: string[],
    setOtpArr: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otpArr];
    updated[index] = value.slice(-1);
    setOtpArr(updated);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    otpArr: string[],
    setOtpArr: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (e.key === 'Backspace' && !otpArr[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleResetOtpChange = (index: number, value: string) =>
    handleOtpChange(index, value, resetOtp, setResetOtp);
  const handleResetOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) =>
    handleOtpKeyDown(e, index, resetOtp, setResetOtp);

  // ── Submit handlers ────────────────────────────────────────────────────────
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Login failed.');
        } else {
          navigate('/profile');
        }
      } else {
        const res = await signup(email, password, confirmPassword, username);
        if (!res.success) {
          setError(res.error || 'Signup failed.');
        } else {
          setScreen('otp-verify');
          setSuccessMsg(`A 6-digit code was sent to ${email}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits.'); return; }

    setLoading(true);
    try {
      const res = await verifyEmail(email, code);
      if (!res.success) {
        setError(res.error || 'Invalid OTP.');
      } else {
        setSuccessMsg('Email verified! Please log in.');
        setTimeout(() => {
          setScreen('auth');
          setIsLogin(true);
          setOtp(['', '', '', '', '', '']);
          clearMessages();
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await authAPI.forgotPassword(resetEmail);
      if (data.error) {
        setError(data.error);
      } else {
        setSuccessMsg(`OTP sent to ${resetEmail}`);
        setTimeout(() => { setScreen('forgot-otp'); clearMessages(); }, 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const data = await authAPI.resetPassword(
        resetEmail, resetOtp.join(''), newPassword, confirmNewPassword
      );
      if (data.error) {
        setError(data.error);
      } else {
        setSuccessMsg('Password reset! Redirecting to login…');
        setTimeout(() => {
          setScreen('auth');
          setIsLogin(true);
          setResetOtp(['', '', '', '', '', '']);
          clearMessages();
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Shared UI pieces ───────────────────────────────────────────────────────
  const Feedback = () => (
    <AnimatePresence>
      {(error || successMsg) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`flex items-start gap-2 text-sm p-3 rounded-xl ${
            error
              ? 'bg-red-50 text-red-600 border border-red-100'
              : 'bg-green-50 text-green-600 border border-green-100'
          }`}
        >
          {error
            ? <AlertCircle size={16} className="mt-0.5 shrink-0" />
            : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
          <span>{error || successMsg}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const OtpGrid = ({
    values, onChange, onKeyDown, idPrefix = 'otp',
  }: {
    values: string[];
    onChange: (i: number, v: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, i: number) => void;
    idPrefix?: string;
  }) => (
    <div className="flex gap-2 justify-center">
      {values.map((v, i) => (
        <input
          key={i}
          id={`${idPrefix}-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={e => onChange(i, e.target.value)}
          onKeyDown={e => onKeyDown(e, i)}
          className="w-11 h-12 text-center text-lg font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white transition-all"
        />
      ))}
    </div>
  );

  // ── Screens ────────────────────────────────────────────────────────────────
  const renderScreen = () => {
    // OTP Verification after signup
    if (screen === 'otp-verify') {
      return (
        <motion.div key="otp-verify" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-gray-900 mx-auto mb-4">
              <KeyRound size={24} />
            </div>
            <h1 className="text-3xl font-heading font-semibold text-gray-900 mb-2">Check your inbox</h1>
            <p className="text-gray-500">Enter the 6-digit code sent to<br /><span className="font-medium text-gray-700">{email}</span></p>
          </div>
          <div className="card p-8 space-y-6">
            <Feedback />
            <form onSubmit={handleOtpVerify} className="space-y-6">
              <OtpGrid values={otp} onChange={(i, v) => handleOtpChange(i, v, otp, setOtp)} onKeyDown={(e, i) => handleOtpKeyDown(e, i, otp, setOtp)} />
              <button type="submit" disabled={loading} className="btn-primary w-full group">
                {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                Verify Email
                {!loading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500">
              Wrong email?{' '}
              <button onClick={() => { setScreen('auth'); clearMessages(); }} className="text-gray-900 font-medium hover:underline">Go back</button>
            </p>
          </div>
        </motion.div>
      );
    }

    // Forgot password — enter email
    if (screen === 'forgot-password') {
      return (
        <motion.div key="forgot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-gray-900 mx-auto mb-4">
              <Lock size={24} />
            </div>
            <h1 className="text-3xl font-heading font-semibold text-gray-900 mb-2">Reset password</h1>
            <p className="text-gray-500">We'll send a reset code to your email.</p>
          </div>
          <div className="card p-8 space-y-6">
            <Feedback />
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="email" placeholder="alex@example.com" className="input-field pl-11" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full group mt-2">
                {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                Send OTP
                {!loading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500">
              <button onClick={() => { setScreen('auth'); clearMessages(); }} className="text-gray-900 font-medium hover:underline">← Back to login</button>
            </p>
          </div>
        </motion.div>
      );
    }

    // Forgot password — verify OTP
    if (screen === 'forgot-otp') {
      return (
        <motion.div key="forgot-otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-gray-900 mx-auto mb-4">
              <KeyRound size={24} />
            </div>
            <h1 className="text-3xl font-heading font-semibold text-gray-900 mb-2">Enter reset code</h1>
            <p className="text-gray-500">Sent to <span className="font-medium text-gray-700">{resetEmail}</span></p>
          </div>
          <div className="card p-8 space-y-6">
            <Feedback />
            <form onSubmit={(e) => { e.preventDefault(); setScreen('reset-password'); }} className="space-y-6">
              <OtpGrid values={resetOtp} onChange={handleResetOtpChange} onKeyDown={handleResetOtpKeyDown} idPrefix="rotp" />
              <button type="submit" className="btn-primary w-full group">
                Continue
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </motion.div>
      );
    }

    // Reset password — new password form
    if (screen === 'reset-password') {
      return (
        <motion.div key="reset" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-gray-900 mx-auto mb-4">
              <Lock size={24} />
            </div>
            <h1 className="text-3xl font-heading font-semibold text-gray-900 mb-2">New password</h1>
            <p className="text-gray-500">Choose a strong new password.</p>
          </div>
          <div className="card p-8 space-y-6">
            <Feedback />
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input-field pl-11 pr-11" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="password" placeholder="••••••••" className="input-field pl-11" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full group mt-2">
                {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                Reset Password
                {!loading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </div>
        </motion.div>
      );
    }

    // Main auth screen (login / signup)
    return (
      <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-gray-900 mx-auto mb-4">
            <Sparkles size={24} />
          </div>
          <h1 className="text-3xl font-heading font-semibold text-gray-900 mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-gray-500">
            {isLogin ? 'Enter your details to access your dashboard.' : 'Start your journey to financial clarity.'}
          </p>
        </div>

        <div className="card p-8">
          {/* Tab toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
            <button onClick={() => { setIsLogin(true); clearMessages(); }} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Log In</button>
            <button onClick={() => { setIsLogin(false); clearMessages(); }} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Sign Up</button>
          </div>

          <Feedback />

          <form onSubmit={handleAuthSubmit} className="space-y-4 mt-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div key="name-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Alex Morgan" className="input-field pl-11" value={username} onChange={e => setUsername(e.target.value)} required={!isLogin} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="email" placeholder="alex@example.com" className="input-field pl-11" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                {isLogin && (
                  <button type="button" onClick={() => { setScreen('forgot-password'); clearMessages(); }} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input-field pl-11 pr-11" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div key="confirm-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="password" placeholder="••••••••" className="input-field pl-11" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required={!isLogin} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-6 group">
              {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              {isLogin ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Social login section */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="btn-secondary py-2.5">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button className="btn-secondary py-2.5">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.88 2.38-3.31 1.9-2.72 6.38.68 7.71-1.02 2.65-2.64 5.14-3.21 2.92zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </div>
    </div>
  );
}

