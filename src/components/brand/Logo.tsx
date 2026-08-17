type LogoMarkProps = { size?: number; className?: string };

export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 256 228"
      width={size}
      height={(size * 228) / 256}
      aria-hidden="true"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M120,22 L22,202" strokeWidth="14" />
        <path d="M120,22 L178,202" strokeWidth="14" />
        <path d="M56,142 L152,142" strokeWidth="9" />
      </g>
      <g className="fill-teal">
        <polygon points="30,182 202,105 208,119 36,196" />
        <polygon points="200,92 242,110 204,131" />
      </g>
    </svg>
  );
}

export function Logo({ dark = false, size = 30 }: { dark?: boolean; size?: number }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 ${dark ? "text-navy-foreground" : "text-primary"}`}
    >
      <LogoMark size={size} />
      <span
        className="font-display font-bold tracking-tight"
        style={{ fontSize: size * 0.72 }}
      >
        acclaira
      </span>
    </span>
  );
}
