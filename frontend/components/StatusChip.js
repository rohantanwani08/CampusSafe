import React from 'react';

export default function StatusChip({ status }) {
  let label = 'Unknown';
  let colorClass = 'text-muted bg-muted/14 border-line';
  let Icon = null;

  switch (status) {
    case 'SAFE':
      label = 'Safe';
      colorClass = 'text-safe bg-safe/14 border-safe/30';
      Icon = () => (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      );
      break;
    case 'NEED_ASSISTANCE':
      label = 'Needs help';
      colorClass = 'text-help bg-help/14 border-help/50';
      Icon = () => (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
      break;
    case 'UNREACHABLE':
      label = "Can't reach";
      // Diagonal hatch pattern uses inline style below, class just sets color
      colorClass = 'text-unreachable border-unreachable/30';
      Icon = () => (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
      break;
    case 'UNCLEAR':
    case 'PENDING':
    default:
      label = 'Waiting for reply';
      colorClass = 'text-waiting bg-waiting/14 border-waiting/30';
      Icon = () => (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
  }

  const hatchStyle = status === 'UNREACHABLE' ? {
    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(127, 144, 163, 0.14) 2px, rgba(127, 144, 163, 0.14) 4px)`
  } : {};

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
      style={hatchStyle}
    >
      {Icon && <Icon />}
      {label}
    </span>
  );
}
