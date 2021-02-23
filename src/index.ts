import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseSortableOptions {
  multiple?: boolean;
  draggingClassNames?: string[];
  dragoverClassNames?: string[];
}

/**
 * Shift array items moving srcIndex before/after targetIndex.
 * TODO: Support multiple adjacent indecies being shifted.
 * TODO: Move this to its own package.
 * @param array The array you want to manipulate
 * @param srcIndex Index of the item that is moving.
 * @param targetIndex Index where the item should be placed.
 * @param insertBeforeTarget Wether the srcItem should be placed before or after the target index.
 * @returns The new array
 */
const shift = <T>(
  array: T[],
  srcIndex: number,
  targetIndex: number,
  insertBeforeTarget = false
) => {
  if (
    srcIndex < 0 ||
    srcIndex > array.length ||
    targetIndex < 0 ||
    targetIndex > array.length
  )
    return array;

  const minIndex = Math.min(srcIndex, targetIndex);
  const maxIndex = Math.max(srcIndex, targetIndex);
  const newArr = [
    ...array.slice(0, minIndex),
    ...(srcIndex < targetIndex ? array.slice(minIndex + 1, maxIndex) : []),
    insertBeforeTarget ? array[srcIndex] : array[targetIndex],
    insertBeforeTarget ? array[targetIndex] : array[srcIndex],
    ...(srcIndex > targetIndex ? array.slice(minIndex + 1, maxIndex) : []),
    ...array.slice(maxIndex + 1),
  ];
  return newArr;
};

export const useSortable = <T>(
  items: T[],
  options: UseSortableOptions
): [
  T[],
  (containerNode: HTMLDivElement | null) => void,
  (node: HTMLDivElement) => void
] => {
  const settings = {
    multiple: false,
    draggingClassNames: ['dragging'],
    dragoverClassNames: ['dragover'],
    ...options,
  };

  const [draggedItemIndex, setDraggedItemIndex] = useState<number>();
  const [dropTargetIndex, setDropTargetIndex] = useState<number>();
  const [shouldInsertBefore, setShouldInsertBefore] = useState<boolean>(false);
  const [draggableNodes, setDraggableNodes] = useState<HTMLDivElement[]>([]);
  const [orderedItems, setOrderedItems] = useState<T[]>(items);

  const addDraggableNodeRef = useCallback((node: HTMLDivElement) => {
    if (!node) return;
    setDraggableNodes(nodes => [...nodes, node]);
  }, []);

  const findItemIndexFromNode = useCallback(
    (node: HTMLDivElement) =>
      draggableNodes.findIndex(draggableNode => draggableNode === node),
    [draggableNodes]
  );

  const onDragStart = useCallback(
    (e: DragEvent) => {
      const el = e.target as HTMLDivElement;
      if (!el) return;
      el.classList.add(...settings.draggingClassNames);
      setDraggedItemIndex(findItemIndexFromNode(el));
      setDropTargetIndex(undefined);
      setShouldInsertBefore(false);
    },
    [findItemIndexFromNode, setDraggedItemIndex, settings.draggingClassNames]
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    return false;
  }, []);

  const onDragEnter = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const el = e.target as HTMLDivElement;
      if (!el) return;
      el.classList.add(...settings.dragoverClassNames);

      return false;
    },
    [settings.dragoverClassNames]
  );
  const onDragLeave = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const el = e.target as HTMLDivElement;
      if (!el) return;
      el.classList.remove(...settings.dragoverClassNames);
      return false;
    },
    [settings.dragoverClassNames]
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const el = e.target as HTMLDivElement;
      if (!el) return;
      setDropTargetIndex(findItemIndexFromNode(el));
      const { x, width, height, y } = el.getBoundingClientRect();
      const { clientX, clientY } = e;
      setShouldInsertBefore(
        clientX < x + width / 2 || clientY < y + height / 2
      );
      el.classList.remove(...settings.dragoverClassNames);
      return false;
    },
    [
      setDropTargetIndex,
      findItemIndexFromNode,
      setShouldInsertBefore,
      settings.dragoverClassNames,
    ]
  );

  const onDragEnd = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const el = e.target as HTMLDivElement;
      if (!el) return;
      el.classList.remove(...settings.draggingClassNames);
      if (draggedItemIndex === undefined || dropTargetIndex === undefined)
        return;
      setOrderedItems(
        shift(
          orderedItems,
          draggedItemIndex,
          dropTargetIndex,
          shouldInsertBefore
        )
      );
      setDraggableNodes(
        shift(
          draggableNodes,
          draggedItemIndex,
          dropTargetIndex,
          shouldInsertBefore
        )
      );
      return false;
    },
    [
      draggedItemIndex,
      dropTargetIndex,
      setOrderedItems,
      orderedItems,
      setDraggableNodes,
      draggableNodes,
      shouldInsertBefore,
      settings.draggingClassNames,
    ]
  );

  const containerRef = useRef<HTMLDivElement>();
  const setContainerRef = useCallback(
    (containerNode: HTMLDivElement | null) => {
      if (containerNode) containerRef.current = containerNode;
    },
    []
  );

  useEffect(() => {
    const containerNode = containerRef.current;
    if (containerNode) {
      containerNode.addEventListener('dragstart', onDragStart);
      containerNode.addEventListener('dragover', onDragOver);
      containerNode.addEventListener('dragenter', onDragEnter);
      containerNode.addEventListener('dragleave', onDragLeave);
      containerNode.addEventListener('dragend', onDragEnd);
      containerNode.addEventListener('drop', onDrop);
      draggableNodes.forEach(node => {
        node.setAttribute('draggable', 'true');
      });
    }
    return () => {
      if (containerNode) {
        containerNode.removeEventListener('dragstart', onDragStart);
        containerNode.removeEventListener('dragover', onDragOver);
        containerNode.removeEventListener('dragenter', onDragEnter);
        containerNode.removeEventListener('dragleave', onDragLeave);
        containerNode.removeEventListener('dragend', onDragEnd);
        containerNode.removeEventListener('drop', onDrop);
        draggableNodes.forEach(node => {
          node.removeAttribute('draggable');
        });
      }
    };
  }, [
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragEnter,
    onDragLeave,
    onDrop,
    draggableNodes,
  ]);

  return [orderedItems, setContainerRef, addDraggableNodeRef];
};
