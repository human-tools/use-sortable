import React from 'react';
import { shift, useSortable } from './index';
import { fireEvent, render } from '@testing-library/react';

describe('shift', () => {
  test('correctly shifts elements after target', () => {
    expect(shift([0, 1, 2, 3, 4], 0, 3, false)).toStrictEqual([1, 2, 3, 0, 4]);
    expect(shift([0, 1, 2, 3, 4], 3, 0, false)).toStrictEqual([0, 3, 1, 2, 4]);
    expect(shift([0, 1, 2, 3, 4], 0, 0, false)).toStrictEqual([0, 1, 2, 3, 4]);
  });
  test('correctly shifts elements before target', () => {
    expect(shift([0, 1, 2, 3, 4], 0, 3, true)).toStrictEqual([1, 2, 0, 3, 4]);
    expect(shift([0, 1, 2, 3, 4], 3, 0, true)).toStrictEqual([3, 0, 1, 2, 4]);
    expect(shift([0, 1, 2, 3, 4], 0, 0, true)).toStrictEqual([0, 1, 2, 3, 4]);
  });
});

describe('useSortable', () => {
  const items = new Array(5).fill(0).map<number>((_, i) => i);
  const App = (): JSX.Element => {
    const [orderedItems, containerRef, addDraggableNodeRef] = useSortable<
      number
    >(items, {
      draggingClassNames: ['dr1', 'dr2'],
      dragoverClassNames: ['do1', 'do2'],
    });

    return (
      <div>
        <div ref={containerRef}>
          {orderedItems.map(item => (
            <div key={item} ref={addDraggableNodeRef}>
              {item + 1}
            </div>
          ))}
        </div>
      </div>
    );
  };

  it('adds draggable=true attributes', () => {
    const { getByText } = render(<App />);
    items.forEach(i => {
      const el = getByText(`${i + 1}`);
      expect(el.getAttribute('draggable')).toBe('true');
    });
  });

  it('adds dragging class names when dragging starts', () => {
    const { getByText } = render(<App />);
    const srcEl = getByText('1');
    fireEvent.dragStart(srcEl);
    expect(srcEl.classList).toContain('dr1');
    expect(srcEl.classList).toContain('dr2');
  });

  it('adds dragover class names when dragging over an element', () => {
    const { getByText } = render(<App />);
    const srcEl = getByText('1');
    const targetEl = getByText('4');
    fireEvent.dragStart(srcEl);
    fireEvent.dragEnter(targetEl, { clientX: 0, clientY: 100 });
    expect(srcEl.classList).toContain('dr1');
    expect(srcEl.classList).toContain('dr2');
  });

  it('reorders element after drag ends', () => {
    const { getByText } = render(<App />);
    const srcEl = getByText('1');
    const targetEl = getByText('4');
    fireEvent.dragStart(srcEl);
    fireEvent.dragEnter(targetEl, { clientX: 0, clientY: 100 });
    fireEvent.drop(targetEl, { clientX: 0, clientY: 100 });
    fireEvent.dragEnd(srcEl, { clientX: 0, clientY: 100 });
    const el5 = getByText('5');
    expect(srcEl.nextSibling).toBe(el5);
    expect(targetEl.nextSibling).toBe(srcEl);
  });

  it('cleans up classes after drag is finished', () => {
    const { getByText } = render(<App />);
    const srcEl = getByText('1');
    const targetEl = getByText('4');
    fireEvent.dragStart(srcEl);
    fireEvent.dragEnter(targetEl, { clientX: 0, clientY: 100 });
    fireEvent.drop(targetEl, { clientX: 0, clientY: 100 });
    fireEvent.dragEnd(srcEl, { clientX: 0, clientY: 100 });
    expect(srcEl.classList).not.toContain('dr1');
    expect(srcEl.classList).not.toContain('dr2');
    expect(targetEl.classList).not.toContain('do1');
    expect(targetEl.classList).not.toContain('do2');
  });
});
