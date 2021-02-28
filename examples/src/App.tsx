import React, { useState } from 'react';

// Note: You'd most likely import useSortable from a npm/yarn installation
// But in order to make the development experience a bit nicer we're
// importing from a copied lib file directly because snowpack doesn't
// support linked packages properly.
// import { useSortable } from '@human-tools/use-sortable';
import { useSortable } from './use-sortable-lib';
import './App.css';

const App = (): JSX.Element => {
  const [items] = useState<number[]>(
    new Array(30).fill(0).map<number>((_, i) => i)
  );
  const {
    orderedItems,
    setItems,
    setContainerRef,
    addDraggableNodeRef,
  } = useSortable<number>(items, {
    animate: true,
    animationDelayFunction: (index: number) => index * 0.03,
    animationDurationFunction: (index: number) => 0.2 + index * 0.02,
    animationTimingFunction: () => 'cubic-bezier(0, 1.28, 1, 1)',
  });

  return (
    <div>
      <div className="card-container" ref={setContainerRef}>
        {orderedItems.map((item: number) => (
          <div
            className="card"
            key={item}
            ref={addDraggableNodeRef}
            id={`debug-id-${item + 1}`}
          >
            {item + 1}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setItems(new Array(50).fill(0).map<number>((_, i) => i + 1));
        }}
      >
        New Items
      </button>
    </div>
  );
};

export default App;
