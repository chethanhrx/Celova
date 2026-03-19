export function SkeletonCard({ aspect = '16/9', className = '' }) {
  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      <div className="skeleton w-full" style={{ aspectRatio: aspect }} />
      <div className="p-2 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="w-full skeleton" style={{ height: '80vh' }} />
  );
}

export function SkeletonRow({ count = 5 }) {
  return (
    <div className="space-y-4">
      <div className="skeleton h-6 w-48 rounded" />
      <div className="flex gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} className="flex-shrink-0 w-48" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16', xl: 'w-24 h-24' };
  return <div className={`skeleton rounded-full ${sizes[size]}`} />;
}
