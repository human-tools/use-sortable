# useSortable

Simple implementation that allows you to reorder items easily using useSortable hook.

## Options

- [Optional] `draggingClassNames`: `string[]` - Default: `['dragging']`
- [Optional] `dragoverClassNames`: `string[]` - Default: `['dragover']`
- [Optional] `animate`: `boolean` - Default: `true`
- [Optional] `animationDelayFunction`: `(index: number) => number` - Default: `() => 0`
- [Optional] `animationDurationFunction`: `(index: number) => number` - Default: `() => 0.3`
- [Optional] `animationTimingFunction`: `(index: number) => string` - Default: `() => 'cubic-bezier(0, 1.28, 1, 1)'`

## Installing

```sh
yarn add @human-tools/use-sortable
# OR
npm install @human-tools/use-sortable
```

## Example

```jsx
import { useState } from 'react';
import * as ReactDOM from 'react-dom';
import { useSortable } from '@human-tools/use-sortable';
import './index.css';

const App = (): JSX.Element => {
  const [items] = useState<number[]>(
    new Array(30).fill(0).map<number>((_, i) => i)
  );
  const { orderedItems, setItems, setContainerRef, addDraggableNodeRef } = useSortable<number>(
    items,
    {}
  );

  return (
    <div>
      <div className="card-container" ref={setContainerRef}>
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

## Contributing

The package uses `@pika/pack` to build and publish the library. The `example` directory is a small `snowpack` react app.

If you want to work on the src of the library while using the example as a scratchpad to see your changes, run:

- `yarn start` in the root directory - This will watch the `src/` and copy the files to `example/src/use-sortable-lib` directory
- `yarn start` in the `example` directory - This will start the normal `snowpack dev` server and watch example files and hmr appropriately.

This setup is mainly because `snowpack` still doesn't have a good support for `yarn/npm link`'d packages.

## Deploying Updated Example Site

This will happen automatically using `Netlify`, all you need to do is merge updated files in.

## Publishing new version of `@human-tools/use-sortable`

Currently one of the maintainers have to run `npx pika publish` and follow the prompts. This will probably eventually be automated anytime `master` branch is updated.

## License

MIT
