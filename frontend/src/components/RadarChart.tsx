/** 四维雷达图组件 - SVG实现 */

import React from 'react';

interface RadarChartProps {
  scores: {
    ats: number;
    content: number;
    project: number;
    match: number;
  };
  maxScores: {
    ats: number;
    content: number;
    project: number;
    match: number;
  };
  size?: number;
  blurred?: boolean;
}

interface DimensionConfig {
  key: 'ats' | 'content' | 'project' | 'match';
  label: string;
}

const DIMENSIONS: DimensionConfig[] = [
  { key: 'ats', label: 'ATS通过率' },
  { key: 'content', label: '内容质量' },
  { key: 'project', label: '项目经历' },
  { key: 'match', label: '岗位匹配' },
];

const ANGLES = [-90, 0, 90, 180]; // 顶部、右侧、底部、左侧

const RadarChart: React.FC<RadarChartProps> = ({
  scores,
  maxScores,
  size = 300,
  blurred = false,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  const levels = 5;

  const getPoint = (index: number, value: number, maxValue: number) => {
    const angle = (ANGLES[index] * Math.PI) / 180;
    const ratio = maxValue > 0 ? value / maxValue : 0;
    const r = radius * ratio;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const scorePoints = DIMENSIONS.map((dim, i) => {
    const score = scores[dim.key];
    const max = maxScores[dim.key];
    return getPoint(i, score, max);
  });

  const scorePathData = scorePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ') + ' Z';

  const gridPolygons = [];
  for (let level = 1; level <= levels; level++) {
    const ratio = level / levels;
    const points = ANGLES.map((angleDeg) => {
      const angle = (angleDeg * Math.PI) / 180;
      const r = radius * ratio;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    });
    gridPolygons.push(points.join(' '));
  }

  const axisLines = ANGLES.map((angleDeg, i) => {
    const angle = (angleDeg * Math.PI) / 180;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return { x, y, label: DIMENSIONS[i].label, score: scores[DIMENSIONS[i].key], max: maxScores[DIMENSIONS[i].key] };
  });

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className={blurred ? 'blur-sm' : ''}>
        {/* Grid */}
        {gridPolygons.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke={i === levels - 1 ? '#e5e7eb' : '#f3f4f6'}
            strokeWidth={i === levels - 1 ? 1.5 : 1}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((axis, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={axis.x}
            y2={axis.y}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}

        {/* Score area */}
        <path
          d={scorePathData}
          fill="rgba(99, 102, 241, 0.2)"
          stroke="rgb(99, 102, 241)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Score points */}
        {scorePoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="rgb(99, 102, 241)" />
        ))}
      </svg>

      {/* Labels */}
      {axisLines.map((axis, i) => {
        const labelOffset = 35;
        const angle = (ANGLES[i] * Math.PI) / 180;
        const lx = cx + (radius + labelOffset) * Math.cos(angle);
        const ly = cy + (radius + labelOffset) * Math.sin(angle);

        let textAnchor = 'middle';
        if (i === 1) textAnchor = 'start';
        else if (i === 3) textAnchor = 'end';

        return (
          <div
            key={i}
            className="absolute text-xs text-gray-600 font-medium whitespace-nowrap"
            style={{
              left: lx,
              top: ly,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center' as const,
            }}
          >
            <div>{axis.label}</div>
            <div className="text-primary-600 font-bold">
              {axis.score}/{axis.max}
            </div>
          </div>
        );
      })}

      {/* Center score label */}
      {!blurred && (
        <div
          className="absolute text-lg font-bold text-primary-600"
          style={{ left: cx - 20, top: cy - 14, width: 40, textAlign: 'center' }}
        >
          {Object.values(scores).reduce((a, b) => a + b, 0)}
        </div>
      )}

      {blurred && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default RadarChart;
