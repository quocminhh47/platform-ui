import { render, screen } from '@testing-library/react';
import { RichTextEditor } from './RichTextEditor';

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
