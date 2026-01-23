import React from 'react';
import type { Integration } from '../../calendar/types';
import type { PlatformSettings, PinterestSettings } from './types';

interface PinterestSettingsComponentProps {
    settings: PinterestSettings;
    onChange: (settings: PlatformSettings) => void;
    integration: Integration;
}

export const PinterestSettingsComponent: React.FC<PinterestSettingsComponentProps> = ({
    settings,
    onChange,
}) => {
    const handleBoardChange = (boardId: string) => {
        onChange({
            ...settings,
            board: boardId,
        });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-newTextColor">Pinterest Settings</h3>

            <div>
                <label className="block text-xs text-textItemBlur mb-2">Board ID *</label>
                <input
                    type="text"
                    value={settings.board || ''}
                    onChange={(e) => handleBoardChange(e.target.value)}
                    placeholder="Enter Board ID"
                    className="w-full bg-newBgColor border border-newBorder rounded px-3 py-2 text-sm text-newTextColor focus:border-btnPrimary outline-none"
                    required
                />
                <div className="text-xs text-textItemBlur space-y-1 mt-2">
                    <p>To find your Pinterest Board ID:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Go to pinterest.com and open the board</li>
                        <li>Copy the board ID from the URL</li>
                        <li>Example: pinterest.com/username/<strong>board-name</strong>/</li>
                        <li>Paste the board name or ID here</li>
                    </ol>
                </div>
            </div>

            <div>
                <label className="block text-xs text-textItemBlur mb-2">Title (optional, max 100 chars)</label>
                <input
                    type="text"
                    value={settings.title || ''}
                    onChange={(e) => onChange({ ...settings, title: e.target.value })}
                    placeholder="Pin Title"
                    maxLength={100}
                    className="w-full bg-newBgColor border border-newBorder rounded px-3 py-2 text-sm text-newTextColor focus:border-btnPrimary outline-none"
                />
            </div>

            <div>
                <label className="block text-xs text-textItemBlur mb-2">Link (optional)</label>
                <input
                    type="url"
                    value={settings.link || ''}
                    onChange={(e) => onChange({ ...settings, link: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full bg-newBgColor border border-newBorder rounded px-3 py-2 text-sm text-newTextColor focus:border-btnPrimary outline-none"
                />
            </div>
        </div>
    );
};
