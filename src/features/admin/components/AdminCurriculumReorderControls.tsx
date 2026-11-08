import { useId, type DragEvent, type KeyboardEvent } from 'react';

type AdminCurriculumReorderControlsProps = {
  subjectLabel: string;
  disableMoveUp: boolean;
  disableMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  dragHandle?: {
    draggable: boolean;
    onDragStart: (event: DragEvent<HTMLButtonElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  };
};

export function AdminCurriculumReorderControls({
  subjectLabel,
  disableMoveUp,
  disableMoveDown,
  onMoveUp,
  onMoveDown,
  dragHandle,
}: AdminCurriculumReorderControlsProps) {
  const groupId = useId();

  return (
    <div className="admin-curriculum-reorder" role="group" aria-labelledby={groupId}>
      <p id={groupId} className="visually-hidden">
        Sắp xếp {subjectLabel}
      </p>
      {dragHandle ? (
        <button
          type="button"
          className="admin-curriculum-drag-handle"
          draggable={dragHandle.draggable}
          aria-label={`Kéo để đổi thứ tự ${subjectLabel}`}
          onDragStart={dragHandle.onDragStart}
          onKeyDown={dragHandle.onKeyDown}
        >
          ⋮⋮
        </button>
      ) : null}
      <button
        type="button"
        className="admin-curriculum-move-button"
        aria-label={`Di chuyển ${subjectLabel} lên`}
        disabled={disableMoveUp}
        onClick={onMoveUp}
      >
        ↑
      </button>
      <button
        type="button"
        className="admin-curriculum-move-button"
        aria-label={`Di chuyển ${subjectLabel} xuống`}
        disabled={disableMoveDown}
        onClick={onMoveDown}
      >
        ↓
      </button>
    </div>
  );
}
