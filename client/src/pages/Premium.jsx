import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Check, Zap, Crown, Star } from 'lucide-react';
import { paymentAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { useState } from 'react';

const PLAN_ICONS = { Monthly: Zap, Quarterly: Star, Annual: Crown };
const PLAN_COLORS = { Monthly: 'var(--orange)', Quarterly: 'var(--cyan)', Annual: 'var(--gold)' };

export default function Premium() {
  const { isAuthenticated, checkPremium } = useAuthStore();
  const [loading, setLoading] = useState(null);

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => paymentAPI.getPlans().then(r => r.data.plans),
  });

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) { toast.error('Sign in first'); return; }
    setLoading(plan._id);
    try {
      const { data } = await paymentAPI.createCheckout(plan._id);
      if (data.sessionUrl) window.location.href = data.sessionUrl;
      else toast.error(data.message || 'Stripe not configured.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create checkout session.');
    }
    setLoading(null);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="badge mx-auto mb-4" style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--gold)', border: '1px solid rgba(251,191,36,0.3)' }}>
          ✦ Celova Premium
        </div>
        <h1 className="font-syne font-black text-4xl md:text-5xl mb-4" style={{ color: 'var(--text)' }}>
          Unlock the Full Experience
        </h1>
        <p className="font-dm text-lg max-w-xl mx-auto" style={{ color: 'var(--text2)' }}>
          Ad-free streaming, downloads, early access, and exclusive creator features. Cancel anytime.
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
        {(plans || []).map((plan, idx) => {
          const Icon = PLAN_ICONS[plan.name] || Zap;
          const color = PLAN_COLORS[plan.name] || 'var(--orange)';
          const isPopular = plan.name === 'Quarterly';

          return (
            <div key={plan._id}
              className="relative rounded-2xl p-6 transition-transform hover:-translate-y-1"
              style={{
                background: isPopular ? `linear-gradient(135deg, rgba(34,211,238,0.08), rgba(34,211,238,0.03))` : 'var(--surface)',
                border: `2px solid ${isPopular ? 'var(--cyan)' : 'var(--border)'}`,
                boxShadow: isPopular ? '0 0 40px rgba(34,211,238,0.15)' : '0 4px 20px rgba(0,0,0,0.3)',
              }}>
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="badge text-[11px] text-white px-3 py-1"
                        style={{ background: 'var(--cyan)', color: '#000' }}>
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <p className="font-syne font-bold" style={{ color: 'var(--text)' }}>{plan.name}</p>
                  <p className="text-xs font-dm" style={{ color: 'var(--text3)' }}>{plan.durationDays} days</p>
                </div>
              </div>

              <div className="mb-5">
                <span className="font-syne font-black text-4xl" style={{ color: 'var(--text)' }}>₹{plan.price}</span>
                <span className="text-sm font-dm" style={{ color: 'var(--text2)' }}>/{plan.name.toLowerCase()}</span>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features?.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: color }} />
                    <span className="text-sm font-dm" style={{ color: 'var(--text2)' }}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan._id || checkPremium()}
                className="w-full py-3 rounded-xl font-syne font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isPopular ? 'var(--cyan)' : 'var(--orange)',
                  color: isPopular ? '#000' : '#fff',
                  boxShadow: `0 0 20px ${isPopular ? 'rgba(34,211,238,0.3)' : 'rgba(249,115,22,0.3)'}`,
                }}>
                {checkPremium() ? '✓ Already Premium' : loading === plan._id ? 'Redirecting...' : `Get ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ / Feature comparison */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-syne font-bold text-2xl text-center mb-8" style={{ color: 'var(--text)' }}>
          What's included?
        </h2>
        {[
          ['Ad-free streaming', true, true, true],
          ['HD & 4K quality', true, true, true],
          ['Download episodes', true, true, true],
          ['Watch Party host', true, true, true],
          ['Early access to new releases', false, true, true],
          ['Priority support', false, true, true],
          ['Exclusive creator badge', false, false, true],
          ['Behind-the-scenes access', false, false, true],
        ].map(([feature, monthly, quarterly, annual]) => (
          <div key={feature} className="flex items-center gap-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="flex-1 text-sm font-dm" style={{ color: 'var(--text2)' }}>{feature}</p>
            {[monthly, quarterly, annual].map((has, i) => (
              <div key={i} className="w-16 text-center">
                {has ? (
                  <Check size={16} className="mx-auto" style={{ color: ['var(--orange)', 'var(--cyan)', 'var(--gold)'][i] }} />
                ) : (
                  <span style={{ color: 'var(--text3)' }}>—</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
