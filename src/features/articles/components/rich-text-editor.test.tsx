import { render, screen } from '@testing-library/react';
import { RichTextEditor } from './RichTextEditor';

const { setContent } = vi.hoisted(() => ({ setContent: vi.fn() }));

function mockChain() {
  const chain = {
    undo: () => chain,
    redo: () => chain,
    setParagraph: () => chain,
    toggleHeading: () => chain,
    toggleBold: () => chain,
    toggleItalic: () => chain,
    toggleUnderline: () => chain,
    toggleStrike: () => chain,
    toggleBulletList: () => chain,
    toggleOrderedList: () => chain,
    toggleBlockquote: () => chain,
    setHorizontalRule: () => chain,
    extendMarkRange: () => chain,
    setLink: () => chain,
    unsetLink: () => chain,
    setImage: () => chain,
    run: () => true,
  };
  return {
    focus: () => chain,
  };
}

vi.mock('@tiptap/react', () => ({
  useEditor: () => ({
    getHTML: () => '<p>Hi</p>',
    commands: { setContent: setContent },
    isActive: () => false,
    can: () => ({
      chain: () => ({
        focus: () => ({
          undo: () => ({ run: () => true }),
          redo: () => ({ run: () => true }),
          toggleBold: () => ({ run: () => true }),
          toggleItalic: () => ({ run: () => true }),
          toggleUnderline: () => ({ run: () => true }),
          toggleStrike: () => ({ run: () => true }),
        }),
      }),
    }),
    chain: mockChain,
    getAttributes: () => ({}),
    setEditable: vi.fn(),
  }),
  EditorContent: () => <div data-testid="editor-content" />,
}));

describe('RichTextEditor', () => {
  it('renders toolbar and editor surface', () => {
    const onHtmlChange = vi.fn();
    render(
      <RichTextEditor
        editorKey="test"
        initialHtml="<p>Hi</p>"
        onHtmlChange={onHtmlChange}
      />,
    );
    expect(screen.getByRole('toolbar', { name: 'Định dạng văn bản' })).toBeTruthy();
    expect(screen.getByTestId('editor-content')).toBeTruthy();
  });
});

it('reloads saved content without emitting an author edit', () => {
  setContent.mockClear();
  const { rerender } = render(<RichTextEditor editorKey="same" initialHtml="<p>Hi</p>" onHtmlChange={vi.fn()} />);
  rerender(<RichTextEditor editorKey="same" initialHtml="<p>Saved sanitized body</p>" onHtmlChange={vi.fn()} />);
  expect(setContent).toHaveBeenCalledWith('<p>Saved sanitized body</p>', { emitUpdate: false });
});
