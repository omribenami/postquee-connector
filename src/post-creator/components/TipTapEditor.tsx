import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onAIRefine?: () => void; // Optional callback for AI refinement
}

/**
 * TipTap Rich Text Editor
 */
export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  placeholder = 'Write your post...',
  onAIRefine,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-btnPrimary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  // Sync content updates from parent
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-newBorder rounded-lg overflow-hidden bg-newBgColor">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-newBorder bg-newBgColorInner">
        {/* Bold */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-newBoxHover ${editor.isActive('bold') ? 'bg-newBoxHover text-btnPrimary' : 'text-textItemBlur'
            }`}
          title="Bold (Ctrl+B)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          </svg>
        </button>

        {/* Italic */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-newBoxHover ${editor.isActive('italic') ? 'bg-newBoxHover text-btnPrimary' : 'text-textItemBlur'
            }`}
          title="Italic (Ctrl+I)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M14 20h-4M15 4L9 20" />
          </svg>
        </button>

        {/* Underline */}
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-newBoxHover ${editor.isActive('underline') ? 'bg-newBoxHover text-btnPrimary' : 'text-textItemBlur'
            }`}
          title="Underline (Ctrl+U)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v7a5 5 0 0 0 10 0V4M5 21h14" />
          </svg>
        </button>

        <div className="w-px h-6 bg-newBorder mx-1" />

        {/* Link */}
        <button
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-2 rounded hover:bg-newBoxHover ${editor.isActive('link') ? 'bg-newBoxHover text-btnPrimary' : 'text-textItemBlur'
            }`}
          title="Add Link"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>

        {/* Bullet List */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-newBoxHover ${editor.isActive('bulletList') ? 'bg-newBoxHover text-btnPrimary' : 'text-textItemBlur'
            }`}
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="ml-auto flex items-center gap-2">
          {/* AI Refine Button */}
          {onAIRefine && (
            <>
              <button
                onClick={onAIRefine}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium transition-all"
                title="AI Refine Content"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
                AI Refine
              </button>
              <div className="w-px h-6 bg-newBorder mx-1" />
            </>
          )}

          {/* Character count */}
          <span className="text-xs text-textItemBlur">
            {editor.storage.characterCount?.characters() || editor.getText().length} characters
          </span>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};
