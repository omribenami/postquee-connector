import React, { useRef } from 'react';

interface MediaItem {
  id: string;
  path: string;
  type: 'image' | 'video';
}

interface MediaUploadProps {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  maxFiles?: number;
  required?: boolean;
  requirementMessage?: string;
}

/**
 * Media Upload Component
 * Simple file upload with preview (can be enhanced with Uppy in Phase 5)
 */
export const MediaUpload: React.FC<MediaUploadProps> = ({
  media,
  onChange,
  maxFiles = 4,
  required = false,
  requirementMessage = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // For now, create object URLs for preview
    // In production, this would upload to PostQuee API
    const newMedia: MediaItem[] = Array.from(files).map((file) => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      path: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
    }));

    onChange([...media, ...newMedia].slice(0, maxFiles));

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (id: string) => {
    onChange(media.filter((item) => item.id !== id));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-newTextColor mb-3">
        Media ({media.length}/{maxFiles})
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {/* Warning message for required media */}
      {required && media.length === 0 && requirementMessage && (
        <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-400 text-sm flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{requirementMessage}</span>
        </div>
      )}

      {/* Media grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {media.map((item) => (
            <div key={item.id} className="relative group aspect-square">
              {item.type === 'image' ? (
                <img
                  src={item.path}
                  alt=""
                  className="w-full h-full object-cover rounded border border-newBorder"
                />
              ) : (
                <video
                  src={item.path}
                  className="w-full h-full object-cover rounded border border-newBorder"
                />
              )}

              {/* Remove button */}
              <button
                onClick={() => removeMedia(item.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {media.length < maxFiles && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-4 border-2 border-dashed border-newBorder rounded-lg hover:border-btnPrimary hover:bg-newBoxHover transition-colors text-textItemBlur hover:text-newTextColor"
        >
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <div className="text-sm">Click to upload media</div>
          <div className="text-xs mt-1">Images or videos (max {maxFiles})</div>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
