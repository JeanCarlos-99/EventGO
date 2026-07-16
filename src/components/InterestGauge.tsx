// Elemento de assinatura visual do EventGo: um "pin" de mapa que tambem funciona
// como medidor de interesse da comunidade (0-100%), com a mesma paleta usada
// nos marcadores do mapa. Verde/azul/amarelo/vermelho conforme a especificacao.
export function interestColorHex(pct: number) {
  if (pct >= 90) return "#16A34A"; // verde
  if (pct >= 70) return "#2563EB"; // azul
  if (pct >= 50) return "#F5B300"; // amarelo
  return "#E11D48"; // vermelho
}

export default function InterestGauge({ pct, size = 48 }: { pct: number; size?: number }) {
  const color = interestColorHex(pct);
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E4E6ED" strokeWidth={4} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span className="absolute font-mono text-[11px] font-medium" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}
