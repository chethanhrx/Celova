export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo C */}
        <div className="relative">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-slow"
            style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', boxShadow: '0 0 30px rgba(249,115,22,0.5)' }}
          >
            <span className="font-syne font-black text-white text-3xl">C</span>
          </div>
          <div
            className="absolute -inset-1 rounded-2xl animate-spin-slow"
            style={{ background: 'conic-gradient(from 0deg, transparent 70%, #f97316)', borderRadius: '18px', zIndex: -1 }}
          />
        </div>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--orange)',
                animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
        <p className="font-dm text-sm" style={{ color: 'var(--text2)' }}>Loading Celova...</p>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}
