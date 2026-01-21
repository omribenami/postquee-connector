import React, { useState } from 'react';

interface AIRefineModalProps {
  currentContent: string;
  onApply: (refinedContent: string) => void;
  onClose: () => void;
}

/**
 * AI Content Refinement Modal
 * Shows AI-suggested improvements for post content
 */
export const AIRefineModal: React.FC<AIRefineModalProps> = ({
  currentContent,
  onApply,
  onClose,
}) => {
  const [isRefining, setIsRefining] = useState(false);
  const [refinedContent, setRefinedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState('improve');

  const prompts = [
    { value: 'improve', label: 'Improve Overall', description: 'Make it more engaging and professional' },
    { value: 'shorten', label: 'Make Shorter', description: 'Reduce length while keeping key points' },
    { value: 'expand', label: 'Add Details', description: 'Expand with more information' },
    { value: 'casual', label: 'More Casual', description: 'Make the tone more friendly and casual' },
    { value: 'professional', label: 'More Professional', description: 'Make the tone more formal' },
    { value: 'emojis', label: 'Add Emojis', description: 'Add relevant emojis for engagement' },
  ];

  const handleRefine = async () => {
    setIsRefining(true);
    setError(null);

    try {
      // Strip HTML tags for AI processing
      const textContent = currentContent.replace(/<[^>]*>/g, '');

      // Call WordPress REST endpoint for AI refinement
      const { restUrl, nonce } = window.postqueeWP;
      // Use new endpoint to avoid 404 caching issues
      const response = await fetch(`${restUrl}ai-refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({
          content: textContent,
          // Prompt is now optional in backend, passing it anyway
          prompt: selectedPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('AI refinement failed. Please check your API key in settings.');
      }

      const data = await response.json();
      setRefinedContent(data.refined || data.content);
    } catch (err: any) {
      console.error('AI Refine error:', err);
      setError(err.message || 'Failed to refine content. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleApply = () => {
    if (refinedContent) {
      // Wrap in paragraph tags to match TipTap format
      onApply(`<p>${refinedContent}</p>`);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-newBackdrop flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-newSettings rounded-lg border border-newBorder w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-newBorder">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-newTextColor">AI Content Refiner</h2>
          </div>
          <button
            onClick={onClose}
            className="text-textItemBlur hover:text-newTextColor transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Prompt Selection */}
          <div>
            <label className="block text-sm font-medium text-newTextColor mb-3">
              Choose refinement style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {prompts.map((prompt) => (
                <button
                  key={prompt.value}
                  onClick={() => setSelectedPrompt(prompt.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${selectedPrompt === prompt.value
                      ? 'border-btnPrimary bg-btnPrimary/10'
                      : 'border-newBorder hover:border-btnPrimary/50'
                    }`}
                >
                  <div className="font-medium text-newTextColor">{prompt.label}</div>
                  <div className="text-xs text-textItemBlur mt-1">{prompt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Original Content */}
          <div>
            <label className="block text-sm font-medium text-newTextColor mb-2">
              Original Content
            </label>
            <div className="p-4 bg-newBgColorInner border border-newBorder rounded text-textItemBlur text-sm max-h-32 overflow-y-auto">
              {currentContent.replace(/<[^>]*>/g, '') || 'No content yet'}
            </div>
          </div>

          {/* Refined Content */}
          {refinedContent && (
            <div>
              <label className="block text-sm font-medium text-newTextColor mb-2">
                AI Suggestion
              </label>
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded text-newTextColor text-sm max-h-48 overflow-y-auto whitespace-pre-wrap">
                {refinedContent}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-newBorder p-4 bg-newBgColorInner flex items-center justify-between">
          <div className="text-xs text-textItemBlur">
            {!refinedContent && 'Select a style and click Refine to get AI suggestions'}
            {refinedContent && 'Review the suggestion and apply it to your post'}
          </div>

          <div className="flex items-center gap-3">
            {!refinedContent ? (
              <button
                onClick={handleRefine}
                disabled={isRefining || !currentContent.trim()}
                className="px-6 py-2 rounded bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRefining ? 'Refining...' : 'Refine with AI'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setRefinedContent('')}
                  className="px-4 py-2 rounded border border-newBorder text-newTextColor hover:bg-newBoxHover transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleApply}
                  className="px-6 py-2 rounded bg-btnPrimary text-white hover:bg-btnPrimaryHover transition-colors font-medium"
                >
                  Apply Suggestion
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
