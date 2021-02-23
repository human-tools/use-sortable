# useSortable

Simple implementation that allows you to reorder items easily using useSortable hook.

## Options

- [Optional] draggingClassNames: string[]Default: ['dragging']]
- [Optional] dragoverClassNames: string[]Default: ['dragover']]

## Example

```jsx
import { useState } from 'react';
import * as ReactDOM from 'react-dom';
import { useSortable } from '../.';
import './index.css';

const App = (): JSX.Element => {
  const [items] = useState<number[]>(
    new Array(30).fill(0).map<number>((_, i) => i)
  );
  const [orderedItems, containerRef, addDraggableNodeRef] = useSortable<number>(
    items,
    {
      multiple: true,
    }
  );

  return (
    <div>
      <div className="card-container" ref={containerRef}>
        {orderedItems.map(item => (
          <div className="card" key={item} ref={addDraggableNodeRef}>
            {item + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

```css
.card-container {
  display: flex;
  flex-wrap: wrap;
}

.card {
  font-size: 56px;
  color: #ddd;
  background-color: white;
  padding: 30px;
  box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, 0.2);
  margin: 10px;
  cursor: grab;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card:hover {
  background-color: slategrey;
}

.card.dragover {
  box-shadow: 1px 1px 15px 0 rgba(0, 128, 128, 1);
}

.card.dragging {
  cursor: grabbing;
  opacity: 0.2;
}
```

## License

MIT
