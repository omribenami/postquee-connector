import React from 'react';

interface CharacterCounterProps {
  currentLength: number;
  limit: number;
  platform: string;
  remaining: number;
}

/**
 * Character Counter Component
 * Shows current character count and limit with visual warning
 */
export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  currentLength,
  limit,
  platform,
  remaining,
}) => {
  // Calculate percentage for visual indicator
  const percentage = (currentLength / limit) * 100;

  // Determine color based on remaining characters
  const getColorClasses = () => {
    if (remaining < 0) {
      return 'text-red-400 font-semibold'; // Over limit
    } else if (remaining < limit * 0.1) {
      return 'text-orange-400'; // Warning: less than 10% remaining
    } else {
      return 'text-textItemBlur'; // Normal
    }
  };

  // Determine progress bar color
  const getProgressColor = () => {
    if (remaining < 0) {
      return 'bg-red-500';
    } else if (remaining < limit * 0.1) {
      return 'bg-orange-500';
    } else {
      return 'bg-btnPrimary';
    }
  };

  return (
    <div className="space-y-2">
      {/* Text counter */}
      <div className="flex items-center justify-between text-xs">
        <span className={getColorClasses()}>
          {currentLength} / {limit} characters
        </span>
        <span className="text-textItemBlur">{platform}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-newBgColorInner rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Warning message if over limit */}
      {remaining < 0 && (
        <div className="text-xs text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>
            Content exceeds {platform} character limit by {Math.abs(remaining)} characters
          </span>
        </div>
      )}
    </div>
  );
};
