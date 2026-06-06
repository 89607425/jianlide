import React, { useState, useEffect, useRef } from 'react';

interface Stage {
  label: string;
  duration: number;
}

interface Props {
  stages: Stage[];
  autoAdvance?: boolean;
}

const ProgressLoading: React.FC<Props> = ({ stages, autoAdvance = true }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!autoAdvance) return;

    const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);
    let elapsed = 0;
    let stageIndex = 0;

    const advance = () => {
      const stage = stages[stageIndex];
      if (!stage) return;

      const timer = setTimeout(() => {
        elapsed += stage.duration;
        stageIndex += 1;
        setCurrentStage(stageIndex);

        const newProgress = Math.min(
          Math.round((elapsed / totalDuration) * 100),
          95
        );
        setProgress(newProgress);

        if (stageIndex < stages.length) {
          advance();
        }
      }, stage.duration);

      timersRef.current.push(timer);
    };

    setProgress(5);
    advance();

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [stages, autoAdvance]);

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {stages.map((stage, idx) => (
            <div key={idx} className="flex items-center space-x-3">
              {idx < currentStage ? (
                <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : idx === currentStage ? (
                <div className="w-5 h-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
              )}
              <span className={`text-sm ${
                idx < currentStage ? 'text-green-600' :
                idx === currentStage ? 'text-primary-600 font-medium' :
                'text-gray-300'
              }`}>
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressLoading;
