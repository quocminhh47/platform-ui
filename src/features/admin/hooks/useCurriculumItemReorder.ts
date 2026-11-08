import { useCallback, useRef, useState, type DragEvent } from 'react';
import { moveItemByOffset, orderedIds } from '../utils/curriculum-reorder';

type Identifiable = { id: string };

export function useCurriculumItemReorder<T extends Identifiable>(
  items: readonly T[],
  onCommitOrder: (orderedIds: string[]) => Promise<void>,
) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const draggingIdRef = useRef<string | null>(null);

  const commitMove = useCallback(
    async (fromIndex: number, toIndex: number) => {
      const next = moveItemByOffset(items, fromIndex, toIndex);
      await onCommitOrder(orderedIds(next));
    },
    [items, onCommitOrder],
  );

  const moveItem = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) {
        return;
      }
      const toIndex = direction === 'up' ? index - 1 : index + 1;
      await commitMove(index, toIndex);
    },
    [commitMove, items],
  );

  const onDragStart = useCallback((id: string) => {
    return (event: DragEvent) => {
      draggingIdRef.current = id;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', id);
    };
  }, []);

  const onDragOver = useCallback((id: string) => {
    return (event: DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setDragOverId(id);
    };
  }, []);

  const onDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const onDrop = useCallback(
    (targetId: string) => {
      return async (event: DragEvent) => {
        event.preventDefault();
        const sourceId = draggingIdRef.current ?? event.dataTransfer.getData('text/plain');
        draggingIdRef.current = null;
        setDragOverId(null);
        if (!sourceId || sourceId === targetId) {
          return;
        }
        const fromIndex = items.findIndex((item) => item.id === sourceId);
        const toIndex = items.findIndex((item) => item.id === targetId);
        if (fromIndex < 0 || toIndex < 0) {
          return;
        }
        await commitMove(fromIndex, toIndex);
      };
    },
    [commitMove, items],
  );

  return {
    dragOverId,
    moveItem,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
  };
}
