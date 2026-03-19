import { useState } from 'react';
import { userAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { DashboardLayout } from './DashboardHome';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    website: user?.website || '',
    bankAccount: user?.bankAccount || '',
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');

  const handle = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    setSaving(false);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm font-dm outline-none";
  const inputStyle = { background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' };

  return (
    <DashboardLayout title="Settings">
      {/* Tab nav */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ background: 'var(--surface)' }}>
        {['profile', 'account', 'notifications'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-dm capitalize transition-all"
            style={{ background: tab === t ? 'var(--orange)' : 'transparent', color: tab === t ? '#fff' : 'var(--text2)' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-lg">
        {tab === 'profile' && (
          <form onSubmit={handleSave} className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-syne font-black text-3xl"
                         style={{ background: 'var(--orange)', color: '#fff' }}>
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <button type="button" className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--orange)', color: '#fff', border: '2px solid var(--bg)' }}>
                  <Camera size={12} />
                </button>
              </div>
              <div>
                <p className="font-dm font-600 text-sm" style={{ color: 'var(--text)' }}>{user?.name}</p>
                <p className="text-xs font-dm capitalize" style={{ color: 'var(--text3)' }}>{user?.role}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text2)' }}>Display Name</label>
              <input type="text" value={form.name} onChange={handle('name')} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text2)' }}>Bio</label>
              <textarea value={form.bio} onChange={handle('bio')} rows={3} placeholder="Tell your audience about yourself..."
                className={`${inputCls} resize-none`} style={inputStyle} maxLength={200} />
              <p className="text-xs mt-1 text-right font-mono" style={{ color: 'var(--text3)' }}>{form.bio.length}/200</p>
            </div>
            <div>
              <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text2)' }}>Website / Social Link</label>
              <input type="url" value={form.website} onChange={handle('website')} placeholder="https://..." className={inputCls} style={inputStyle} />
            </div>
            {user?.role === 'creator' && (
              <div>
                <label className="text-xs font-syne font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text2)' }}>Bank Account / UPI for Payouts</label>
                <input type="text" value={form.bankAccount} onChange={handle('bankAccount')} placeholder="UPI ID or Bank Account Number"
                  className={inputCls} style={inputStyle} />
              </div>
            )}
            <button type="submit" disabled={saving} className="btn-orange px-6 py-3 rounded-xl font-syne font-bold flex items-center gap-2">
              {saving ? <><span className="animate-spin">⏳</span> Saving...</> : 'Save Changes'}
            </button>
          </form>
        )}

        {tab === 'account' && (
          <div className="space-y-4 rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div>
              <p className="font-syne font-bold mb-1" style={{ color: 'var(--text)' }}>Email Address</p>
              <p className="text-sm font-dm" style={{ color: 'var(--text2)' }}>{user?.email}</p>
            </div>
            <div>
              <p className="font-syne font-bold mb-1" style={{ color: 'var(--text)' }}>Account Role</p>
              <p className="text-sm font-dm capitalize" style={{ color: 'var(--text2)' }}>{user?.role}</p>
            </div>
            <div>
              <p className="font-syne font-bold mb-1" style={{ color: 'var(--text)' }}>Premium Status</p>
              <span className="badge" style={{ background: user?.isPremium ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.08)', color: user?.isPremium ? 'var(--gold)' : 'var(--text3)' }}>
                {user?.isPremium ? `✦ Active until ${new Date(user.premiumExpiry).toLocaleDateString()}` : 'Free plan'}
              </span>
            </div>
            <hr style={{ borderColor: 'var(--border)' }} />
            <div>
              <p className="font-syne font-bold mb-2" style={{ color: 'var(--red)' }}>Danger Zone</p>
              <button onClick={() => toast.error('Please contact support to delete your account.')}
                className="text-sm font-dm px-4 py-2 rounded-lg transition-colors hover:bg-red-500/15"
                style={{ color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)' }}>
                Delete Account
              </button>
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="space-y-3">
            {[
              ['New follower', 'Get notified when someone follows you'],
              ['New comment', 'Get notified when someone comments on your episodes'],
              ['Episode milestone', 'Notify when your episode hits 1K, 10K, 100K views'],
              ['Payout processed', 'Get notified when earnings are paid out'],
              ['Platform news', 'Updates from the Celova team'],
            ].map(([label, desc]) => (
              <div key={label} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div>
                  <p className="font-dm font-600 text-sm" style={{ color: 'var(--text)' }}>{label}</p>
                  <p className="text-xs font-dm" style={{ color: 'var(--text3)' }}>{desc}</p>
                </div>
                <div className="relative" onClick={(e) => {
                  const toggle = e.currentTarget.querySelector('[data-toggle]');
                  toggle.dataset.on = toggle.dataset.on === 'true' ? 'false' : 'true';
                  toggle.style.background = toggle.dataset.on === 'true' ? 'var(--orange)' : 'var(--surface2)';
                  toggle.querySelector('div').style.left = toggle.dataset.on === 'true' ? '20px' : '4px';
                }}>
                  <div data-toggle data-on="true" className="w-10 h-6 rounded-full cursor-pointer transition-colors"
                       style={{ background: 'var(--orange)', position: 'relative' }}>
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all" style={{ left: '20px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
