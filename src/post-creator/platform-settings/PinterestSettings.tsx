import React, { useEffect, useState } from 'react';
import type { Integration } from '../../calendar/types';
import type { PlatformSettings, PinterestSettings } from './types';
import { useProviderFunction } from '../../helpers/useProviderFunction';

interface PinterestSettingsComponentProps {
    settings: PinterestSettings;
    onChange: (settings: PlatformSettings) => void;
    integration: Integration;
}

export const PinterestSettingsComponent: React.FC<PinterestSettingsComponentProps> = ({
    settings,
    onChange,
    integration,
}) => {
    const { callFunction, loading, error } = useProviderFunction();
    const [boards, setBoards] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        if (integration?.id) {
            callFunction(integration.id, 'boards')
                .then((data) => {
                    if (Array.isArray(data)) {
                        setBoards(data);
                        if (!settings.board && data.length > 0) {
                            onChange({ ...settings, board: data[0].id });
                        }
                    }
                })
                .catch((e) => {
                    console.error("Failed to load Pinterest boards", e);
                });
        }
    }, [integration?.id, callFunction]);

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
                <label className="block text-xs text-textItemBlur mb-2">Select Board</label>

                {loading ? (
                    <div className="text-xs text-textItemBlur">Loading boards...</div>
                ) : error ? (
                    <div className="text-xs text-red-500">Error: {error}</div>
                ) : (
                    <select
                        value={settings.board || ''}
                        onChange={(e) => handleBoardChange(e.target.value)}
                        className="w-full bg-newBgColor border border-newBorder rounded px-3 py-2 text-sm text-newTextColor focus:border-btnPrimary outline-none"
                        required
                    >
                        <option value="">-- Select Board --</option>
                        {boards.map((board) => (
                            <option key={board.id} value={board.id}>
                                {board.name}
                            </option>
                        ))}
                    </select>
                )}

                {boards.length === 0 && !loading && !error && (
                    <div className="text-xs text-textItemBlur mt-2">No boards found.</div>
                )}
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
