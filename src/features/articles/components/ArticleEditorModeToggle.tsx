type ArticleEditorModeToggleProps = {
  showPreview: boolean;
  onChange: (showPreview: boolean) => void;
  disabled?: boolean;
};

export function ArticleEditorModeToggle({
  showPreview,
  onChange,
  disabled,
}: ArticleEditorModeToggleProps) {
  return (
    <div
      className="article-editor-mode-toggle"
      role="group"
      aria-label="Chế độ soạn thảo"
    >
      <button
        type="button"
        className={`article-editor-mode-btn${!showPreview ? ' is-active' : ''}`}
        aria-pressed={!showPreview}
        disabled={disabled}
        onClick={() => onChange(false)}
      >
        Soạn thảo
      </button>
      <button
        type="button"
        className={`article-editor-mode-btn${showPreview ? ' is-active' : ''}`}
        aria-pressed={showPreview}
        disabled={disabled}
        onClick={() => onChange(true)}
      >
        Xem trước
      </button>
    </div>
  );
}
