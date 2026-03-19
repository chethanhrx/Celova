import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Tv, Film } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: searchParams.get('role') === 'creator' ? 'creator' : 'viewer',
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name?.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const res = await register(form);
    if (res.success) {
      toast.success('Welcome to Celova! 🎬');
      navigate(form.role === 'creator' ? '/dashboard' : '/');
    } else toast.error(res.message);
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors(er => ({ ...er, [key]: '' }));
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', boxShadow: '0 0 20px rgba(249,115,22,0.4)' }}>
            <span className="font-syne font-black text-white text-xl">C</span>
          </div>
          <span className="font-syne font-black text-2xl"><span style={{ color: 'var(--orange)' }}>C</span><span style={{ color: 'var(--text)' }}>elova</span></span>
        </Link>

        <div className="rounded-2xl p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-syne font-black text-2xl mb-1" style={{ color: 'var(--text)' }}>Create your account</h2>
          <p className="font-dm text-sm mb-6" style={{ color: 'var(--text2)' }}>Join the AI streaming revolution</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'viewer', label: 'Viewer', icon: Tv, desc: 'Watch & discover AI series' },
              { value: 'creator', label: 'Creator', icon: Film, desc: 'Upload & earn from your AI series' },
            ].map(({ value, label, icon: Icon, desc }) => (
              <button key={value} type="button" onClick={() => setForm(f => ({ ...f, role: value }))}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  background: form.role === value ? 'rgba(249,115,22,0.12)' : 'var(--surface2)',
                  border: `2px solid ${form.role === value ? 'var(--orange)' : 'var(--border)'}`,
                  boxShadow: form.role === value ? '0 0 16px rgba(249,115,22,0.2)' : 'none',
                }}>
                <Icon size={20} className="mb-2" style={{ color: form.role === value ? 'var(--orange)' : 'var(--text2)' }} />
                <p className="font-syne font-bold text-sm" style={{ color: form.role === value ? 'var(--orange)' : 'var(--text)' }}>{label}</p>
                <p className="text-xs font-dm mt-0.5" style={{ color: 'var(--text3)' }}>{desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text2)' }}>
                {form.role === 'creator' ? 'Creator Name' : 'Your Name'}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text3)' }} />
                <input type="text" placeholder="John Doe" {...field('name')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-dm outline-none"
                  style={{ background: 'var(--bg3)', color: 'var(--text)', border: `1px solid ${errors.name ? 'var(--red)' : 'var(--border)'}` }} />
              </div>
              {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text2)' }}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text3)' }} />
                <input type="email" placeholder="you@example.com" {...field('email')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-dm outline-none"
                  style={{ background: 'var(--bg3)', color: 'var(--text)', border: `1px solid ${errors.email ? 'var(--red)' : 'var(--border)'}` }} />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text2)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text3)' }} />
                <input type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" {...field('password')}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm font-dm outline-none"
                  style={{ background: 'var(--bg3)', color: 'var(--text)', border: `1px solid ${errors.password ? 'var(--red)' : 'var(--border)'}` }} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text3)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.password}</p>}
              {/* Password strength */}
              {form.password && (
                <div className="flex gap-1 mt-2">
                  {[8, 12, 16].map((min, i) => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-colors"
                         style={{ background: form.password.length >= min ? ['var(--red)', 'var(--orange)', 'var(--green)'][i] : 'var(--surface2)' }} />
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-syne font-bold text-base btn-orange flex items-center justify-center gap-2 mt-2">
              {isLoading ? (
                <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Creating account...</>
              ) : `Join as ${form.role === 'creator' ? 'Creator' : 'Viewer'} →`}
            </button>

            <p className="text-xs text-center font-dm" style={{ color: 'var(--text3)' }}>
              By signing up you agree to our{' '}
              <a href="#" className="underline hover:text-orange-400 transition-colors" style={{ color: 'var(--text2)' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="underline hover:text-orange-400 transition-colors" style={{ color: 'var(--text2)' }}>Privacy Policy</a>
            </p>
          </form>
        </div>

        <p className="text-sm font-dm text-center mt-4" style={{ color: 'var(--text2)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-600 hover:text-orange-400 transition-colors" style={{ color: 'var(--orange)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
