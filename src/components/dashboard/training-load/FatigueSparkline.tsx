const WIDTH = 64;
const HEIGHT = 22;

/**
 * Curva de fatiga del grupo en la ventana de 28 días.
 * Escala compartida (`max`) para que las filas se puedan comparar entre sí.
 */
export function FatigueSparkline({
  series,
  max,
  color,
}: {
  series: readonly number[];
  max: number;
  color: string;
}) {
  if (series.length < 2 || max <= 0) return null;

  const stepX = WIDTH / (series.length - 1);
  const points = series
    .map((value, index) => {
      const y = HEIGHT - Math.min(1, Math.max(0, value / max)) * (HEIGHT - 2) - 1;
      return `${(index * stepX).toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      className="shrink-0 overflow-visible"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
