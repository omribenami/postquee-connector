import React, { useState, useEffect } from 'react';
import type { Integration } from '../../calendar/types';
import type { PlatformSettings, PinterestSettings } from './types';
import { useProviderFunction } from '../../shared/api/provider-functions';

interface Board {
  id: string;
  name: string;
}

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
    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { call } = useProviderFunction();

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await call<Board[]>(integration.id, 'boards');
                setBoards(result || []);
            } catch (err: any) {
                console.error('Failed to fetch Pinterest boards:', err);
                setError(err.message || 'Failed to load boards');
                // Fallback to manual input on error
                setBoards([]);
            } finally {
                setLoading(false);
            }
        };

        if (integration.id) {
            fetchBoards();
        }
    }, [integration.id]);

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
                <label className="block text-xs text-textItemBlur mb-2">Board *</label>
                {loading ? (
                    <div className="text-sm text-textItemBlur">Loading boards...</div>
                ) : error || boards.length === 0 ? (
                    <>
                        <input
                            type="text"
                            value={settings.board || ''}
                            onChange={(e) => handleBoardChange(e.target.value)}
                            placeholder="Enter Board ID"
                            className="w-full bg-newBgColor border border-newBorder rounded px-3 py-2 text-sm text-newTextColor focus:border-btnPrimary outline-none"
                            required
                        />
                        {error && (
                            <p className="text-xs text-red-400 mt-1">{error}</p>
                        )}
                    </>
                ) : (
                    <select
                        value={settings.board || ''}
                        onChange={(e) => handleBoardChange(e.target.value)}
                        className="w-full bg-newBgColor border border-newBorder rounded px-3 py-2 text-sm text-newTextColor focus:border-btnPrimary outline-none"
                        required
                    >
                        <option value="">Select a board...</option>
                        {boards.map((board) => (
                            <option key={board.id} value={board.id}>
                                {board.name}
                            </option>
                        ))}
                    </select>
                )}
                <p className="text-xs text-textItemBlur mt-1">Required for Pinterest posts</p>
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
