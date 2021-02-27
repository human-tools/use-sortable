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
  const [
    orderedItems,
    setItems,
    setContainerRef,
    addDraggableNodeRef,
  ] = useSortable<number>(items, {
    multiple: true,
  });

  return (
    <div>
      <div className="card-container" ref={setContainerRef}>
        {orderedItems.map((item: number) => (
          <div className="card" key={item} ref={addDraggableNodeRef}>
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
