import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const res = await login(form.email, form.password);
    if (res.success) { toast.success('Welcome back! 🎬'); navigate('/'); }
    else toast.error(res.message);
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors(er => ({ ...er, [key]: '' }));
    },
  });

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 p-12 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(251,146,60,0.03))' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(249,115,22,0.12) 0%, transparent 60%)',
        }} />
        <div className="relative text-center max-w-sm">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float"
               style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', boxShadow: '0 0 60px rgba(249,115,22,0.4)' }}>
            <span className="font-syne font-black text-white text-4xl">C</span>
          </div>
          <h1 className="font-syne font-black text-5xl mb-4" style={{ color: 'var(--text)' }}>
            <span style={{ color: 'var(--orange)' }}>C</span>elova
          </h1>
          <p className="font-dm text-xl mb-8" style={{ color: 'var(--text2)' }}>
            Where AI Brings Stories to Life
          </p>
          <div className="space-y-3 text-left">
            {['Thousands of AI-animated series', 'Creator dashboard & earnings', 'Watch parties with friends', 'HD streaming, ad-free with Premium'].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                     style={{ background: 'rgba(249,115,22,0.2)', color: 'var(--orange)' }}>
                  ✓
                </div>
                <span className="font-dm text-sm" style={{ color: 'var(--text2)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 lg:max-w-lg flex flex-col justify-center px-6 md:px-12 py-12">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
            <span className="font-syne font-black text-white">C</span>
          </div>
          <span className="font-syne font-black text-xl"><span style={{ color: 'var(--orange)' }}>C</span><span style={{ color: 'var(--text)' }}>elova</span></span>
        </Link>

        <h2 className="font-syne font-black text-3xl mb-2" style={{ color: 'var(--text)' }}>Welcome back</h2>
        <p className="font-dm mb-8" style={{ color: 'var(--text2)' }}>Sign in to continue watching</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text2)' }}>Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text3)' }} />
              <input type="email" placeholder="you@example.com" {...field('email')}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-dm outline-none transition-all"
                style={{ background: 'var(--surface)', color: 'var(--text)', border: `1px solid ${errors.email ? 'var(--red)' : 'var(--border)'}` }} />
            </div>
            {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text2)' }}>Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text3)' }} />
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••" {...field('password')}
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm font-dm outline-none transition-all"
                style={{ background: 'var(--surface)', color: 'var(--text)', border: `1px solid ${errors.password ? 'var(--red)' : 'var(--border)'}` }} />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.password}</p>}
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-dm hover:text-orange-400 transition-colors" style={{ color: 'var(--text2)' }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-syne font-bold text-base btn-orange flex items-center justify-center gap-2 mt-2">
            {isLoading ? (
              <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Signing in...</>
            ) : 'Sign In →'}
          </button>
        </form>

        <p className="text-sm font-dm text-center mt-6" style={{ color: 'var(--text2)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-600 hover:text-orange-400 transition-colors" style={{ color: 'var(--orange)' }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
