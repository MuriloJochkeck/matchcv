export function ScoreRing({ score, size = "large" }: { score: number; size?: "small" | "large" }) {
  const degrees = Math.max(0, Math.min(100, score)) * 3.6;
  const dimensions = size === "large" ? "size-38 sm:size-44" : "size-20";
  return (
    <div
      aria-label={`Pontuação ${score} de 100`}
      className={`relative grid shrink-0 place-items-center rounded-full ${dimensions}`}
      role="img"
      style={{ background: `conic-gradient(#145c43 0deg ${degrees}deg, #e4e8e2 ${degrees}deg 360deg)` }}
    >
      <div className="absolute inset-[9px] rounded-full bg-white" />
      <div className="relative text-center">
        <strong className={size === "large" ? "text-5xl tracking-[-0.06em]" : "text-2xl tracking-[-0.04em]"}>{score}</strong>
        <span className="ml-0.5 text-xs font-bold text-[#5b655e]">/100</span>
      </div>
    </div>
  );
}
