import React from 'react';

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number;
  color?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ radius, stroke, progress, color = 'currentColor' }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
      <circle
        className="text-stone-200/40 dark:text-stone-700/40 stroke-current text-[color:var(--muted)]/20"
        strokeWidth={stroke}
        fill="transparent"
        r={normalizedRadius}
        cx={radius} cy={radius}
      />
      <circle
        className={`${color} stroke-current transition-all duration-1000 ease-in-out`}
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset }}
        strokeLinecap="round"
        fill="transparent"
        r={normalizedRadius}
        cx={radius} cy={radius}
      />
    </svg>
  );
};

export default ProgressRing;
