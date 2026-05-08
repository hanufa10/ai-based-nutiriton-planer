export function Ring({
  size = 96,
  stroke = 10,
  value,
  color,
  track = "rgba(255,255,255,0.14)",
}: {
  size?: number;
  stroke?: number;
  value: number;
  color: string;
  track?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        fill="none"
      />
    </svg>
  );
}

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] ${className}`}
    >
      {children}
    </section>
  );
}
