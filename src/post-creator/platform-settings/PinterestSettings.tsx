import React, { useState, useEffect } from 'react';
import type { Integration } from '../../calendar/types';
import type { PlatformSettings, PinterestSettings, YouTubeSettings } from './types';

interface PinterestSettingsComponentProps {
    settings: PinterestSettings;
    onChange: (settings: PlatformSettings) => void;
    integration: Integration; // Needed to fetch boards? (Not implemented in mock yet)
}

export const PinterestSettingsComponent: React.FC<PinterestSettingsComponentProps> = ({
    settings,
    onChange,
}) => {
    const [board, setBoard] = useState(settings.Board || '');
    const [title, setTitle] = useState(settings.title || '');
    const [link, setLink] = useState(settings.link || '');

    useEffect(() => {
        onChange({
            ...settings,
            Board: board, // Map local state to Uppercase 'Board' per API error
            title,
            link,
        });
    }, [board, title, link]);

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-newTextColor">Pinterest Settings</h3>

            <div>
                <label className="block text-xs text-textItemBlur mb-1">Board *</label>
                <input
                    type="text"
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    placeholder="Enter Board Name or ID (e.g. My Board)"
                    className="w-full bg-newBgColor border border-newBorder rounded px-3 py-2 text-sm text-newTextColor focus:border-btnPrimary outline-none"
                />
                <p className="text-xs text-textItemBlur mt-1">Required for Pinterest</p>
            </div>

            <div>
                <label className="block text-xs text-textItemBlur mb-1">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Pin Title"
                    className="w-full bg-newBgColor border border-newBorder rounded px-3 py-2 text-sm text-newTextColor focus:border-btnPrimary outline-none"
                />
            </div>

            <div>
                <label className="block text-xs text-textItemBlur mb-1">Link</label>
                <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Destination URL (optional)"
                    className="w-full bg-newBgColor border border-newBorder rounded px-3 py-2 text-sm text-newTextColor focus:border-btnPrimary outline-none"
                />
            </div>
        </div>
    );
};
