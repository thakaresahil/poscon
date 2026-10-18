import { useState } from "react";

const WIDTH = 960;
const HEIGHT = 240;
const MARGIN = { top: 16, right: 8, bottom: 28, left: 56 };
const BAR_GAP = 2;
const BAR_COLOR = "#ef4444";

const formatRupees = (value) => `₹${value.toLocaleString("en-IN")}`;

const formatDay = (day) =>
  new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

// Rounds a max value up to a tidy number for the y axis
const niceMax = (value) => {
  if (value <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((multiple) => multiple * magnitude >= value);
  return step * magnitude;
};

// Bar with a 4px rounded top that sits flat on the baseline
const barPath = (x, y, width, height) => {
  const radius = Math.min(4, width / 2, height);
  const base = y + height;
  return `M${x},${base} V${y + radius} Q${x},${y} ${x + radius},${y} H${x + width - radius} Q${x + width},${y} ${x + width},${y + radius} V${base} Z`;
};

function SalesChart({ data }) {
  const [hovered, setHovered] = useState(null);

  const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const maxValue = niceMax(Math.max(...data.map((point) => point.revenue)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => fraction * maxValue);
  const slot = plotWidth / data.length;
  const barWidth = Math.max(1, slot - BAR_GAP);
  const yFor = (value) => MARGIN.top + plotHeight - (value / maxValue) * plotHeight;

  const hoveredPoint = hovered === null ? null : data[hovered];

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="font-semibold">Revenue, last 30 days</figcaption>
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto"
          role="img"
          aria-label="Bar chart of daily revenue for the last 30 days"
          onMouseLeave={() => setHovered(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={WIDTH - MARGIN.right}
                y1={yFor(tick)}
                y2={yFor(tick)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={MARGIN.left - 8}
                y={yFor(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="11"
                fill="#6b7280"
              >
                {formatRupees(tick)}
              </text>
            </g>
          ))}

          {data.map((point, index) => {
            const x = MARGIN.left + index * slot + BAR_GAP / 2;
            const height = (point.revenue / maxValue) * plotHeight;
            return (
              <g key={point.day}>
                {height > 0 && (
                  <path
                    d={barPath(x, yFor(point.revenue), barWidth, height)}
                    fill={BAR_COLOR}
                    opacity={hovered === null || hovered === index ? 1 : 0.45}
                  />
                )}
                {/* Full height hit target so short bars are easy to hover */}
                <rect
                  x={MARGIN.left + index * slot}
                  y={MARGIN.top}
                  width={slot}
                  height={plotHeight}
                  fill="transparent"
                  onMouseEnter={() => setHovered(index)}
                />
                {index % 7 === 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={HEIGHT - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#6b7280"
                  >
                    {formatDay(point.day)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div
            className="absolute pointer-events-none whitespace-nowrap bg-white border border-gray-200 shadow rounded px-3 py-2 text-sm"
            style={{
              left: `${((MARGIN.left + (hovered + 0.5) * slot) / WIDTH) * 100}%`,
              top: 0,
              transform: hovered > data.length / 2 ? "translateX(-105%)" : "translateX(5%)",
            }}
          >
            <p className="text-gray-500">{formatDay(hoveredPoint.day)}</p>
            <p className="font-semibold">{formatRupees(hoveredPoint.revenue)}</p>
            <p className="text-gray-500">
              {hoveredPoint.orders} {hoveredPoint.orders === 1 ? "order" : "orders"}
            </p>
          </div>
        )}
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-blue-600">View as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-1">Date</th>
              <th className="py-1">Orders</th>
              <th className="py-1">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.day} className="border-b border-gray-100">
                <td className="py-1">{formatDay(point.day)}</td>
                <td className="py-1">{point.orders}</td>
                <td className="py-1">{formatRupees(point.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

export default SalesChart;
