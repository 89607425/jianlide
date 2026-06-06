/** 条形评分组件 */

import React from 'react';

interface ScoreBarProps {
  score: number;
  maxScore: number;
  label: string;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ score, maxScore, label }) => {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const getColor = (pct: number): string => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-blue-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-gray-600 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 w-16 text-right">
        {score}/{maxScore}
      </span>
    </div>
  );
};

export default ScoreBar;
