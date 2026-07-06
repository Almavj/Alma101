import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
  Link as LinkIcon,
  Highlighter,
  Undo2,
  Redo2,
  Palette,
  Minus,
  Quote,
  Code,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-border mx-0.5" />;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const presetColors = [
    { name: "White", value: "#ffffff" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Yellow", value: "#eab308" },
    { name: "Green", value: "#22c55e" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a855f7" },
    { name: "Pink", value: "#ec4899" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Lime", value: "#84cc16" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Emerald", value: "#10b981" },
    { name: "Sky", value: "#0ea5e9" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Gray", value: "#9ca3af" },
    { name: "Black", value: "#000000" },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const path = `blog-images/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("videos")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        console.error("Image upload error", error);
        return;
      }

      const { data: publicData } = supabase.storage
        .from("videos")
        .getPublicUrl(data.path);

      const url = publicData?.publicUrl ?? "";
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Color,
      TextStyle,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline cursor-pointer" } }),
      Placeholder.configure({ placeholder }),
      Highlight.configure({ multicolor: true }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base prose-invert max-w-none min-h-[200px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className={`border rounded-lg bg-background overflow-hidden ${className ?? ""}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <div className="relative" ref={colorPickerRef}>
          <ToolbarButton
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </ToolbarButton>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-card border border-border rounded-lg shadow-xl z-50 w-56">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Pick a color</p>
              <div className="grid grid-cols-6 gap-1.5 mb-3">
                {presetColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.name}
                    onClick={() => {
                      editor.chain().focus().setColor(c.value).run();
                      setShowColorPicker(false);
                    }}
                    className="w-7 h-7 rounded-full border-2 border-border hover:border-primary transition-colors cursor-pointer"
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className="w-full text-xs text-muted-foreground hover:text-foreground py-1.5 mb-2 rounded bg-muted/50 hover:bg-muted transition-colors"
              >
                Reset to default
              </button>
              <div className="flex items-center gap-2 border-t border-border pt-2">
                <label className="text-xs text-muted-foreground">Custom:</label>
                <input
                  type="color"
                  onChange={(e) => {
                    editor.chain().focus().setColor(e.target.value).run();
                    setShowColorPicker(false);
                  }}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  placeholder="#hex"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        editor.chain().focus().setColor(val).run();
                        setShowColorPicker(false);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                  className="flex-1 text-xs px-2 py-1 rounded bg-muted border border-border text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight({ multicolor: true }).run()}
          active={editor.isActive("highlight")}
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Insert Link">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={handleImageUpload} title="Insert Image">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
