import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

export interface UseSortableOptions {
  animate?: boolean;
  animationDelayFunction?: (index: number) => number;
  animationDurationFunction?: (index: number) => number;
  animationTimingFunction?: (index: number) => string;
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
export const shift = <T>(
  array: T[],
  srcIndex: number,
  targetIndex: number,
  insertBeforeTarget = false
) => {
  if (
    srcIndex < 0 ||
    srcIndex > array.length ||
    targetIndex < 0 ||
    targetIndex > array.length ||
    srcIndex === targetIndex
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

/**
 * TODO: Allow user to cancel a reorder while dragging an element
 * by hitting ESC.
 */
export const useSortable = <T>(
  items: T[],
  options: UseSortableOptions
): {
  orderedItems: T[];
  setItems: (items: T[]) => void;
  setContainerRef: (containerNode: HTMLDivElement | null) => void;
  addDraggableNodeRef: (node: HTMLDivElement) => void;
} => {
  const settings = useMemo(
    () => ({
      multiple: false,
      animate: true,
      animationDelayFunction: (): number => 0,
      animationDurationFunction: (): number => 0.3,
      animationTimingFunction: (): string => 'cubic-bezier(0, 1.28, 1, 1)',
      draggingClassNames: ['dragging'],
      dragoverClassNames: ['dragover'],
      ...options,
    }),
    [options]
  );

  const [draggedItemIndex, setDraggedItemIndex] = useState<number>();
  const [dropTargetIndex, setDropTargetIndex] = useState<number>();
  const [shouldInsertBefore, setShouldInsertBefore] = useState<boolean>(false);
  const [draggableNodes, setDraggableNodes] = useState<HTMLDivElement[]>([]);
  const [orderedItems, setOrderedItems] = useState<T[]>(items);

  // FIXME: originalRects need to update when the layout updates or resize.
  // Need a ResizingObserver on the container ref probably.
  const [originalRects, setOriginalRects] = useState<DOMRect[]>([]);
  const [isUpdatingRects, setIsUpdatingRects] = useState<boolean>(false);

  const setItems = useCallback((items: T[]) => {
    setDraggableNodes([]);
    setOriginalRects([]);
    setDropTargetIndex(undefined);
    setDraggedItemIndex(undefined);
    setOrderedItems(items);
  }, []);

  const addDraggableNodeRef = useCallback(
    (node: HTMLDivElement) => {
      if (!node) return;
      setDraggableNodes(nodes => [...nodes, node]);
      setOriginalRects(rects => [...rects, node.getBoundingClientRect()]);
    },
    [orderedItems]
  );

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
      const draggedIndex = findItemIndexFromNode(el);
      setDraggedItemIndex(draggedIndex);
      setDropTargetIndex(undefined);
      setShouldInsertBefore(false);
    },
    [findItemIndexFromNode, setDraggedItemIndex, settings.draggingClassNames]
  );

  const updateTransforms = useCallback(
    (srcIdx: number, targetIdx: number) => {
      setIsUpdatingRects(true);
      const newItemRects = shift(
        originalRects,
        srcIdx,
        targetIdx,
        shouldInsertBefore
      );
      const newDraggableNodes = shift(
        draggableNodes,
        srcIdx,
        targetIdx,
        shouldInsertBefore
      );
      newDraggableNodes.forEach((node, index) => {
        const oldRect = originalRects[index];
        const newRect = newItemRects[index];
        const sign = -1;
        const translateX = sign * (newRect.x - oldRect.x);
        const translateY = sign * (newRect.y - oldRect.y);
        node.style.transition = `transform ${settings.animationDurationFunction(
          index
        )}s ${settings.animationDelayFunction(
          index
        )}s ${settings.animationTimingFunction(index)}`;
        node.style.transform = `translate(${translateX}px, ${translateY}px)`;
      });
      setIsUpdatingRects(false);
    },
    [
      shouldInsertBefore,
      originalRects,
      draggableNodes,
      setIsUpdatingRects,
      settings.animationDelayFunction,
      settings.animationDurationFunction,
      settings.animationTimingFunction,
    ]
  );

  const onDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const el = e.target as HTMLDivElement;
      if (!el || draggedItemIndex === undefined) return;
      const srcIdx = draggedItemIndex;
      const targetIdx = findItemIndexFromNode(el);
      const draggedNode = draggableNodes[draggedItemIndex];
      if (targetIdx === -1) {
        return;
      }
      if (draggedNode === el || srcIdx === targetIdx) {
        return;
      }

      if (!isUpdatingRects) {
        settings.animate && updateTransforms(srcIdx, targetIdx);
        setDropTargetIndex(targetIdx);
        setShouldInsertBefore(srcIdx > targetIdx);
      }
      return false;
    },
    [
      draggedItemIndex,
      draggableNodes,
      findItemIndexFromNode,
      updateTransforms,
      isUpdatingRects,
      setDropTargetIndex,
      setShouldInsertBefore,
      settings.animate,
    ]
  );

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
      el.classList.remove(...settings.dragoverClassNames);
      return false;
    },
    [settings.dragoverClassNames]
  );

  const onDragEnd = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const el = e.target as HTMLDivElement;
      if (!el) return;
      el.classList.remove(...settings.draggingClassNames);
      if (draggedItemIndex === undefined || dropTargetIndex === undefined)
        return;
      settings.animate &&
        draggableNodes.forEach(node => {
          node.style.transition = '';
          node.style.transform = '';
        });
      setItems(
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
      setItems,
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

  return { orderedItems, setItems, setContainerRef, addDraggableNodeRef };
};
