/**
 * Marca do SaudeCode.
 *
 * O glifo é o próprio objeto do sistema: os três alvos de um QR Code,
 * com o quarto canto ocupado por uma cruz — o que a leitura entrega.
 */
export function Glifo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {[
        [1, 1],
        [20, 1],
        [1, 20],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect
            x={x}
            y={y}
            width="11"
            height="11"
            rx="1"
            stroke="currentColor"
            strokeWidth="2.4"
          />
          <rect x={x + 4} y={y + 4} width="3" height="3" fill="currentColor" />
        </g>
      ))}
      <path
        d="M25.5 20v11M20 25.5h11"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function Marca({
  compacta = false,
  className = "",
}: {
  compacta?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Glifo className="h-6 w-6 shrink-0 text-carbono" />
      {!compacta && (
        <span className="font-display text-[19px] font-semibold leading-none tracking-tight">
          Saude<span className="text-carbono">Code</span>
        </span>
      )}
    </span>
  );
}
