/** 环形评分组件 */

import React from 'react';

interface ScoreRingProps {
  score: number;
  maxScore: number;
  label: string;
  size?: number;
  strokeWidth?: number;
}

const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  maxScore,
  label,
  size = 120,
  strokeWidth = 8,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = maxScore > 0 ? score / maxScore : 0;
  const offset = circumference * (1 - percentage);

  // 根据得分比例选择颜色
  const getColor = (ratio: number): string => {
    if (ratio >= 0.8) return '#22c55e'; // 绿色
    if (ratio >= 0.6) return '#3b82f6'; // 蓝色
    if (ratio >= 0.4) return '#f59e0b'; // 黄色
    return '#ef4444'; // 红色
  };

  const color = getColor(percentage);

  return (
    <div className="flex flex-col items-center space-y-2">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* 背景圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* 进度圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-400">/{maxScore}</span>
      </div>
      <span className="text-sm text-gray-600 font-medium">{label}</span>
    </div>
  );
};

export default ScoreRing;
