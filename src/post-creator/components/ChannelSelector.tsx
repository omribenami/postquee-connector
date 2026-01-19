import React from 'react';
import type { Integration } from '../../calendar/types';

interface ChannelSelectorProps {
  integrations: Integration[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

/**
 * Channel Selection Component
 * Displays available integrations as circular icons
 */
export const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  integrations,
  selectedIds,
  onChange,
}) => {
  const toggleChannel = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (integrations.length === 0) {
    return (
      <div className="p-4 bg-newBgColorInner rounded-lg border border-newBorder text-center">
        <p className="text-textItemBlur mb-2">No channels connected</p>
        <p className="text-xs text-textItemBlur">
          Connect channels in PostQuee settings to start posting
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-newTextColor mb-3">
        Select Channels
      </label>
      <div className="flex flex-wrap gap-3">
        {integrations.map((integration) => {
          const isSelected = selectedIds.includes(integration.id);
          const isDisabled = integration.disabled;

          return (
            <button
              key={integration.id}
              onClick={() => !isDisabled && toggleChannel(integration.id)}
              disabled={isDisabled}
              className={`relative group ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              title={integration.name}
            >
              {/* Channel icon */}
              <div
                className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-btnPrimary ring-2 ring-btnPrimary/30'
                    : 'border-newBorder grayscale hover:grayscale-0'
                }`}
              >
                {integration.picture ? (
                  <img
                    src={integration.picture}
                    alt={integration.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-newBgColorInner flex items-center justify-center text-newTextColor font-semibold">
                    {integration.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Selection checkmark */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-btnPrimary rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Channel name tooltip */}
              <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-newSettings px-2 py-1 rounded text-xs text-newTextColor whitespace-nowrap border border-newBorder">
                  {integration.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-3 text-sm text-textItemBlur">
          {selectedIds.length} channel{selectedIds.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};
