"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import { ImageDropzone } from "@/components/admin/ImageDropzone";

interface BlogEditorProps {
  initialContent?: string;
  onChange: (html: string) => void;
}

export function BlogEditor({ initialContent, onChange }: BlogEditorProps) {
  const [showImageModal, setShowImageModal] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: initialContent ?? "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when initialContent changes (for edit page hydration)
  useEffect(() => {
    if (editor && initialContent && editor.isEmpty) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  if (!editor) return null;

  function handleImageUpload(url: string) {
    editor?.chain().focus().setImage({ src: url }).run();
    setShowImageModal(false);
  }

  const toolbarBtn = (
    label: string,
    active: boolean,
    onClick: () => void,
    title?: string
  ) => (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      className={[
        "px-2 py-1 text-sm rounded border transition-colors",
        active
          ? "bg-slate-700 text-white border-slate-700"
          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-200">
        {toolbarBtn("B", editor.isActive("bold"), () =>
          editor.chain().focus().toggleBold().run(), "Bold"
        )}
        {toolbarBtn("I", editor.isActive("italic"), () =>
          editor.chain().focus().toggleItalic().run(), "Italic"
        )}
        {toolbarBtn("H2", editor.isActive("heading", { level: 2 }), () =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        )}
        {toolbarBtn("H3", editor.isActive("heading", { level: 3 }), () =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        )}
        {toolbarBtn("• List", editor.isActive("bulletList"), () =>
          editor.chain().focus().toggleBulletList().run(), "Bullet List"
        )}
        {toolbarBtn("1. List", editor.isActive("orderedList"), () =>
          editor.chain().focus().toggleOrderedList().run(), "Ordered List"
        )}
        {toolbarBtn("\"\"", editor.isActive("blockquote"), () =>
          editor.chain().focus().toggleBlockquote().run(), "Blockquote"
        )}
        <div className="w-px bg-slate-300 mx-1" />
        {toolbarBtn("↩ Undo", false, () =>
          editor.chain().focus().undo().run()
        )}
        {toolbarBtn("↪ Redo", false, () =>
          editor.chain().focus().redo().run()
        )}
        <div className="w-px bg-slate-300 mx-1" />
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          className="px-2 py-1 text-sm rounded border bg-white text-slate-700 border-slate-300 hover:bg-slate-100 transition-colors"
          title="Insert Image"
        >
          Image
        </button>
      </div>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 min-h-[300px] focus:outline-none"
      />

      {/* Image modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Insert Image</h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <ImageDropzone onUpload={handleImageUpload} />
          </div>
        </div>
      )}
    </div>
  );
}
