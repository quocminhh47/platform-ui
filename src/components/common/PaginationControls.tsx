type PaginationControlsProps = {
  page: number;
  totalPages: number;
  totalElements: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  label?: string;
};

export function PaginationControls({
  page,
  totalPages,
  totalElements,
  disabled,
  onPageChange,
  label = 'Trang',
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination-controls" aria-label={label}>
      <p className="pagination-summary muted">
        {totalElements} mục · {label} {page + 1}/{totalPages}
      </p>
      <div className="pagination-actions">
        <button
          type="button"
          className="button-secondary"
          disabled={disabled || page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          Trang trước
        </button>
        <button
          type="button"
          className="button-secondary"
          disabled={disabled || page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Trang sau
        </button>
      </div>
    </nav>
  );
}
