---
name: Swipe and drag alternatives
description: Swipe to delete, drag to reorder, sliders, carousels and drag-and-drop need a single click or tap alternative, and a swipe must be cancellable before release
criteria:
  - STD-SC-2.5.1
  - STD-SC-2.5.2
  - STD-SC22-2.5.7
---

# Swipe and drag alternatives

## When to use

Any gesture with a path or a drag: swipe a row to remove or archive it, drag to reorder, drag and drop a file or card, a swipeable carousel, pull to refresh, a drawn signature, a range slider you build yourself. Also pinch and two-finger gestures.

## The two rules agents break

**1. The gesture is the only way.** Swipe-to-remove that works is still a lock-out for people who cannot hold a press while moving: tremor, a head pointer, eye gaze, voice control, a switch, a keyboard. Everything a swipe or drag does must also work with a single click or tap, with no path: a "Remove" button, "Move up" and "Move down" buttons, a "Choose file" button next to the drop zone, previous and next buttons for a carousel.

**2. The action fires before release, or cannot be called off.** If the row is removed the moment it crosses half its width, a slip removes it. Decide on release (`pointerup`), and only if the pointer is still past the threshold then. Moving back before release, or `pointercancel`, puts the row back with nothing removed.

## Swipe to remove, done right

```html
<li class="line">
  <div class="line-content">Rain jacket, 1 × €189.00</div>
  <button type="button" class="remove">Remove Rain jacket</button>
</li>
```

```js
function swipeable(row, onRemove) {
  let startX = null;
  let dx = 0;

  row.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    startX = event.clientX;
    row.setPointerCapture(event.pointerId);
  });

  row.addEventListener("pointermove", (event) => {
    if (startX === null) return;
    dx = Math.min(0, event.clientX - startX);
    row.style.transform = `translateX(${dx}px)`;
  });

  const end = (event) => {
    if (startX === null) return;
    const past = event.type === "pointerup" && -dx > row.offsetWidth / 2;
    startX = null;
    dx = 0;
    row.style.transform = "";
    if (past) onRemove();
  };

  row.addEventListener("pointerup", end);
  row.addEventListener("pointercancel", end);
}

row.querySelector(".remove").addEventListener("click", () => removeLine(row));
swipeable(row, () => removeLine(row));
```

- The decision uses where the pointer is at release, not the furthest point it reached.
- `touch-action: pan-y` on the row keeps vertical scrolling and gives horizontal moves to the script.
- The button is always visible, not only after a swipe reveals it.

## DO

- Give each single-pointer alternative a visible name that says what and which: "Remove Rain jacket".
- Move focus somewhere sensible after a removal: the next row's button, or the list heading when the list is empty.
- Announce the removal in a status region: "Rain jacket removed from cart".

## DO NOT

- Do not remove, submit or navigate on `pointerdown` or `touchstart`.
- Do not hide the button until a swipe reveals it.
- Do not make dragging the only way to reorder; add "Move up" and "Move down".

## React and frameworks

Keep the drag offset in a ref and decide in `onPointerUp`.

```jsx
function Line({ line, onRemove }) {
  const start = useRef(null);
  const rowRef = useRef(null);
  const [dx, setDx] = useState(0);

  const end = (released) => {
    const remove = released && -dx > rowRef.current.offsetWidth / 2;
    start.current = null;
    setDx(0);
    if (remove) onRemove(line.id);
  };

  return (
    <li
      ref={rowRef}
      style={{ transform: `translateX(${dx}px)`, touchAction: "pan-y" }}
      onPointerDown={(e) => {
        if (e.target.closest("button")) return;
        start.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) =>
        start.current !== null && setDx(Math.min(0, e.clientX - start.current))
      }
      onPointerUp={() => end(true)}
      onPointerCancel={() => end(false)}
    >
      {line.name}
      <button type="button" onClick={() => onRemove(line.id)}>
        Remove {line.name}
      </button>
    </li>
  );
}
```

## What to verify

- Remove a line with the button alone, by mouse and by keyboard.
- Swipe past half and release: it is removed. Swipe past half, come back, release: it stays.
