const VARIANTS = {
  default:
    "bg-[#1a1e25] text-[#e8eaed] border border-[#252b36] hover:bg-[#1f242d] hover:border-[#4a5568]",
  primary:
    "bg-[#4f8ef7] text-white border border-transparent hover:bg-[#6ba0f9]",
  ghost:
    "bg-transparent text-[#8b95a3] border border-transparent hover:bg-[#1a1e25] hover:text-[#e8eaed]",
  danger:
    "bg-red-500/10 text-red-400 border border-transparent hover:bg-red-500/20",
};

const SIZES = {
  sm: "text-xs px-2.5 py-1.5",
  md: "text-sm px-3.5 py-2",
  lg: "text-sm px-4 py-2.5",
};

export default function Button({
  children,
  variant = "default",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  onClick,
  className = "",
  style,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
