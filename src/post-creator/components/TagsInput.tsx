import React, { useState, useRef, useEffect } from 'react';

export interface Tag {
  label: string;
  value: string;
}

interface TagsInputProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  availableTags?: Tag[]; // Optional list of existing tags
}

/**
 * Tags Input Component
 * Allows creating and selecting tags with autocomplete
 */
export const TagsInput: React.FC<TagsInputProps> = ({
  selectedTags,
  onChange,
  availableTags = [],
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter available tags based on input
  const suggestions = availableTags.filter(
    (tag) =>
      tag.label.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedTags.some((selected) => selected.value === tag.value)
  );

  // Handle adding a tag
  const addTag = (tag: Tag) => {
    if (!selectedTags.some((t) => t.value === tag.value)) {
      onChange([...selectedTags, tag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  // Handle creating a new tag from input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag: Tag = {
        label: inputValue.trim(),
        value: inputValue.trim().toLowerCase().replace(/\s+/g, '-'),
      };
      addTag(newTag);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag on backspace if input is empty
      onChange(selectedTags.slice(0, -1));
    }
  };

  // Handle removing a tag
  const removeTag = (tagToRemove: Tag) => {
    onChange(selectedTags.filter((tag) => tag.value !== tagToRemove.value));
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-newTextColor mb-3">
        Tags (optional)
      </label>

      <div className="relative">
        {/* Tags container */}
        <div className="min-h-[42px] px-3 py-2 bg-newBgColor border border-newBorder rounded focus-within:border-btnPrimary transition-colors">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Selected tags */}
            {selectedTags.map((tag) => (
              <span
                key={tag.value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-btnPrimary/10 border border-btnPrimary/20 rounded text-btnPrimary text-sm"
              >
                {tag.label}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-400 transition-colors"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              placeholder={selectedTags.length === 0 ? 'Add tags...' : ''}
              className="flex-1 min-w-[120px] bg-transparent text-newTextColor placeholder-textItemBlur outline-none"
            />
          </div>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-newBgColorInner border border-newBorder rounded shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((tag) => (
              <button
                key={tag.value}
                type="button"
                onClick={() => addTag(tag)}
                className="w-full px-3 py-2 text-left text-newTextColor hover:bg-newBoxHover transition-colors"
              >
                {tag.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-textItemBlur">
        Press Enter to create a new tag, or select from suggestions
      </p>
    </div>
  );
};
