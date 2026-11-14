import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

export type RichTextEditorProps = {
  editorKey: string;
  initialHtml: string;
  disabled?: boolean;
  onHtmlChange: (html: string) => void;
  'aria-invalid'?: boolean;
};

export function RichTextEditor({
  editorKey,
  initialHtml,
  disabled,
  onHtmlChange,
  'aria-invalid': ariaInvalid,
}: RichTextEditorProps) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          link: false,
          underline: false,
          heading: { levels: [1, 2, 3] },
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
        }),
        Image.configure({ allowBase64: false }),
      ],
      content: initialHtml || '<p></p>',
      editable: !disabled,
      onUpdate: ({ editor: ed }) => {
        onHtmlChange(ed.getHTML());
      },
    },
    [editorKey],
  );

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (editor && editor.getHTML() !== initialHtml) {
      editor.commands.setContent(initialHtml || '<p></p>', { emitUpdate: false });
    }
  }, [editor, initialHtml]);

  if (!editor) {
    return <p className="page-status">Đang khởi tạo trình soạn thảo…</p>;
  }

  const locked = Boolean(disabled);

  return (
    <div className="article-rich-editor" data-testid="rich-text-editor">
      <div className="article-rich-editor-toolbar" role="toolbar" aria-label="Định dạng văn bản">
        <div className="article-rich-editor-toolbar-scroll">
          <div className="article-rich-editor-toolbar-group" role="presentation">
            <ToolbarButton
              label="In đậm"
              active={editor.isActive('bold')}
              disabled={locked || !editor.can().chain().focus().toggleBold().run()}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              B
            </ToolbarButton>
            <ToolbarButton
              label="In nghiêng"
              active={editor.isActive('italic')}
              disabled={locked || !editor.can().chain().focus().toggleItalic().run()}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              I
            </ToolbarButton>
            <ToolbarButton
              label="Gạch chân"
              active={editor.isActive('underline')}
              disabled={locked || !editor.can().chain().focus().toggleUnderline().run()}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              U
            </ToolbarButton>
            <ToolbarButton
              label="Gạch ngang"
              active={editor.isActive('strike')}
              disabled={locked || !editor.can().chain().focus().toggleStrike().run()}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              S
            </ToolbarButton>
          </div>
          <span className="article-rich-editor-divider" aria-hidden="true" />
          <div className="article-rich-editor-toolbar-group" role="presentation">
            <ToolbarButton
              label="Đoạn văn"
              active={editor.isActive('paragraph')}
              disabled={locked}
              onClick={() => editor.chain().focus().setParagraph().run()}
            >
              P
            </ToolbarButton>
            <ToolbarButton
              label="Tiêu đề 1"
              active={editor.isActive('heading', { level: 1 })}
              disabled={locked}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              H1
            </ToolbarButton>
            <ToolbarButton
              label="Tiêu đề 2"
              active={editor.isActive('heading', { level: 2 })}
              disabled={locked}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              label="Tiêu đề 3"
              active={editor.isActive('heading', { level: 3 })}
              disabled={locked}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              H3
            </ToolbarButton>
          </div>
          <span className="article-rich-editor-divider" aria-hidden="true" />
          <div className="article-rich-editor-toolbar-group" role="presentation">
            <ToolbarButton
              label="Danh sách bullet"
              active={editor.isActive('bulletList')}
              disabled={locked}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              •
            </ToolbarButton>
            <ToolbarButton
              label="Danh sách số"
              active={editor.isActive('orderedList')}
              disabled={locked}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              1.
            </ToolbarButton>
            <ToolbarButton
              label="Trích dẫn"
              active={editor.isActive('blockquote')}
              disabled={locked}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              “
            </ToolbarButton>
            <ToolbarButton
              label="Đường kẻ ngang"
              disabled={locked}
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              ―
            </ToolbarButton>
          </div>
          <span className="article-rich-editor-divider" aria-hidden="true" />
          <div className="article-rich-editor-toolbar-group" role="presentation">
            <ToolbarButton
              label="Liên kết"
              active={editor.isActive('link')}
              disabled={locked}
              onClick={() => toggleLink(editor)}
            >
              Link
            </ToolbarButton>
            <ToolbarButton label="Ảnh URL" disabled={locked} onClick={() => insertImage(editor)}>
              Img
            </ToolbarButton>
          </div>
          <span className="article-rich-editor-divider" aria-hidden="true" />
          <div className="article-rich-editor-toolbar-group" role="presentation">
            <ToolbarButton
              label="Hoàn tác"
              disabled={locked || !editor.can().chain().focus().undo().run()}
              onClick={() => editor.chain().focus().undo().run()}
            >
              Undo
            </ToolbarButton>
            <ToolbarButton
              label="Làm lại"
              disabled={locked || !editor.can().chain().focus().redo().run()}
              onClick={() => editor.chain().focus().redo().run()}
            >
              Redo
            </ToolbarButton>
          </div>
        </div>
      </div>
      <EditorContent
        editor={editor}
        className="article-rich-editor-content"
        aria-invalid={ariaInvalid}
      />
    </div>
  );
}

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: string;
};

function ToolbarButton({ label, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`article-rich-editor-btn${active ? ' is-active' : ''}`}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

type EditorLike = NonNullable<ReturnType<typeof useEditor>>;

function toggleLink(editor: EditorLike) {
  if (editor.isActive('link')) {
    editor.chain().focus().unsetLink().run();
    return;
  }
  const previous = editor.getAttributes('link').href as string | undefined;
  const url = window.prompt('URL liên kết (https://…)', previous ?? 'https://');
  if (url === null) {
    return;
  }
  const trimmed = url.trim();
  if (!trimmed) {
    editor.chain().focus().unsetLink().run();
    return;
  }
  editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
}

function insertImage(editor: EditorLike) {
  const url = window.prompt('URL ảnh (https://…)');
  if (url === null) {
    return;
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return;
  }
  editor.chain().focus().setImage({ src: trimmed }).run();
}
