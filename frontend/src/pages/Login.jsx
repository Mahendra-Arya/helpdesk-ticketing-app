import React, { useState } from 'react';
import { Headset, Eye, EyeOff, Monitor, ArrowLeft, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // State untuk mode Reset Password
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPasswordReset, setNewPasswordReset] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginSession } = useAuth();
  const navigate = useNavigate();

  // Handler Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user } = response.data;
      loginSession(token, user);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Handler Reset Password dengan Validasi Minimal 8 Karakter
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validasi Sisi Klien (Minimal 8 Karakter)
    if (newPasswordReset.length < 8) {
      setErrorMsg('Password baru minimal harus terdiri dari 8 karakter.');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/reset-password', { 
        email: resetEmail, 
        newPassword: newPasswordReset 
      });
      setSuccessMsg(response.data.message || 'Password berhasil direset! Silakan login.');
      setTimeout(() => {
        setIsResetMode(false);
        setSuccessMsg('');
        setResetEmail('');
        setNewPasswordReset('');
      }, 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal mereset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-130">
        
        {/* Kolom Kiri: Form Login / Reset Password */}
        <div className="bg-[#0256B3] text-white p-8 md:p-10 flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10 max-w-sm mx-auto w-full">
            
            {!isResetMode ? (
              /* --- FORM LOGIN --- */
              <>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">Helpdesk App</h2>
                <p className="text-blue-100 text-xs mb-6">Silakan masuk untuk mengelola tiket bantuan.</p>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-[#E52E42] text-white text-xs font-semibold rounded-xl">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl">
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 text-xs">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-full px-5 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-full pl-5 pr-12 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#E52E42] hover:bg-red-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setIsResetMode(true); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-blue-200 hover:text-white text-[11px] font-semibold underline transition cursor-pointer"
                    >
                      Lupa password?
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* --- FORM RESET PASSWORD --- */
              <>
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => { setIsResetMode(false); setErrorMsg(''); setSuccessMsg(''); }}
                    className="p-1 hover:bg-white/10 rounded-full transition text-blue-200 hover:text-white cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Reset Password</h2>
                </div>
                <p className="text-blue-100 text-xs mb-6">Masukkan email terdaftar dan sandi baru Anda (min. 8 karakter).</p>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-[#E52E42] text-white text-xs font-semibold rounded-xl">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl">
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                  <input
                    type="email"
                    placeholder="Email terdaftar"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-full px-5 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />

                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Password Baru (Min. 8 Karakter)"
                      value={newPasswordReset}
                      onChange={(e) => setNewPasswordReset(e.target.value)}
                      required
                      minLength={8}
                      className="w-full bg-white/10 border border-white/20 rounded-full pl-5 pr-12 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition focus:outline-none cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#E52E42] hover:bg-red-600 text-white font-bold py-3 rounded-full shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <KeyRound className="w-4 h-4" /> {loading ? 'Memproses...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>

        {/* Kolom Kanan: Ilustrasi & Logo */}
        <div className="p-8 md:p-10 flex flex-col justify-between items-center text-center bg-slate-50">
          <div className="flex items-center gap-2 self-end text-[#0256B3] font-bold text-xs">
            <div className="w-7 h-7 bg-linear-to-tr from-indigo-600 to-blue-500 rounded-full flex items-center justify-center text-white shadow-md">
              <Headset className="w-3.5 h-3.5" />
            </div>
            HELPDESK PRO
          </div>

          <div className="my-auto flex flex-col items-center">
            <div className="w-48 h-36 bg-blue-50/80 border border-blue-100 rounded-2xl flex items-center justify-center shadow-inner mb-6">
              <Monitor className="w-20 h-20 text-[#0256B3]" />
            </div>
            <h1 className="text-xl font-black text-[#0256B3] tracking-wider uppercase">Ticketing System</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">Internal Helpdesk</p>
          </div>
          
          <p className="text-[10px] text-slate-400">Beta v1.0 • Internal System</p>
        </div>

      </div>
    </div>
  );
};

export default Login;