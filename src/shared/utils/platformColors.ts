export const platformColors: Record<string, string> = {
    discord: '#5865F2',
    facebook: '#1877F2',
    instagram: '#E4405F', // Gradient usually, but fallback to main color
    linkedin: '#0A66C2',
    pinterest: '#BD081C',
    slack: '#4A154B',
    tiktok: '#000000',
    twitter: '#1DA1F2',
    x: '#000000',
    youtube: '#FF0000',
    threads: '#000000',
};

export const getPlatformColor = (identifier: string): string => {
    const id = identifier.toLowerCase();
    return platformColors[id] || '#808080'; // Default grey
};

export const getPlatformGradient = (identifier: string): string => {
    const id = identifier.toLowerCase();
    if (id === 'instagram') {
        return 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';
    }
    return getPlatformColor(id);
};
