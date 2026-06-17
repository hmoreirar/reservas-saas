interface LogoProps {
  showText?: boolean;
  className?: string;
}

export default function Logo({ showText = true, className = "" }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        className="h-7 w-7 text-text"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <circle cx="12" cy="15" r="2" />
      </svg>
      {showText && (
        <span className="text-lg font-semibold tracking-tight">
          <span className="text-text">Rsv</span>
          <span className="text-text-muted font-light">SaaS</span>
        </span>
      )}
    </div>
  );
}
