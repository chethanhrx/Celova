export default function Button({
  children,
  variant = 'orange',
  size = 'md',
  loading = false,
  icon,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-dm font-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer border-0';

  const variants = {
    orange: 'btn-orange text-white',
    ghost: 'bg-transparent border border-white/10 text-text hover:bg-white/5',
    dark: 'text-white border border-white/10 hover:border-white/20',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'bg-transparent border border-orange text-orange hover:bg-orange/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
    xl: 'px-9 py-4 text-lg',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={variant === 'dark' ? { background: 'var(--surface)' } : undefined}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : icon ? (
        <span className="flex items-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
