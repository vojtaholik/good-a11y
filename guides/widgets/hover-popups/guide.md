---
name: Hover and focus popups
description: Image zoom on hover, link preview cards, hover cards, tooltips and popovers that appear on hover or focus must close with Escape, stay while hovered, and not vanish on their own
criteria:
  - STD-SC-1.4.13
---

# Hover and focus popups

## When to use

Any content that appears when the pointer rests on something or when it takes keyboard focus: an image zoom pane next to a product photo, a link preview card, a user hover card, a tooltip, a "what is this?" bubble, a mega-menu that opens on hover. Not for dialogs and menus opened by a click; those have their own guides.

## The rule agents break: no way to close it in place

A zoom pane that appears beside the photo works well with a mouse. For someone using screen magnification it can cover what they are reading, and the only way to close it is to move the pointer away, which moves their magnified view too. Content that appears on hover or focus must be:

1. **Dismissable**: Escape closes it without moving the pointer or focus. Not needed when it shows an input error, or when it covers and replaces nothing.
2. **Hoverable**: the pointer can move from the trigger onto the new content without it closing.
3. **Persistent**: it stays until the pointer or focus leaves, the user dismisses it, or it stops being relevant. No timer closes it.

## Image zoom, done right

```js
function zoomable(figure, pane) {
  let dismissed = false;

  const show = () => {
    if (!dismissed) pane.hidden = false;
  };
  const hide = () => {
    pane.hidden = true;
  };

  figure.addEventListener("pointerenter", show);
  figure.addEventListener("pointerleave", (event) => {
    if (!pane.contains(event.relatedTarget)) {
      dismissed = false;
      hide();
    }
  });
  pane.addEventListener("pointerleave", (event) => {
    if (!figure.contains(event.relatedTarget)) {
      dismissed = false;
      hide();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !pane.hidden) {
      dismissed = true;
      hide();
    }
  });
}
```

- Escape is caught on `document`, because the pointer is over an image that never has focus.
- After Escape, the pane stays closed until the pointer leaves and comes back.
- Place the pane touching or overlapping the trigger, or bridge the gap, so moving onto it does not cross empty space that counts as leaving.

## Link preview and tooltips

- Show the same content on keyboard focus as on hover, and close it on blur and Escape.
- Link the trigger to it with `aria-describedby` when it is a short description; a preview card with its own links needs a button that opens it instead.
- Open after a short delay (300 ms) and close after a short grace period (300 ms) so a pointer passing over does not flash it, and a pointer moving onto it does not lose it.

## DO

- Handle Escape on `document` with a `keydown` listener while the popup is open, and remove the listener when it closes.
- Keep the popup open while the pointer is over the trigger or the popup.
- Make the popup small enough not to cover the trigger itself.

## DO NOT

- Do not close the popup with a timer.
- Do not use only CSS `:hover` for content that can cover other content; CSS alone cannot close it with Escape.
- Do not leave a gap between the trigger and the popup that closes it when crossed.

## React and frameworks

```jsx
const [open, setOpen] = useState(false);
const [dismissed, setDismissed] = useState(false);

useEffect(() => {
  if (!open) return;
  const onKey = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      setDismissed(true);
    }
  };
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}, [open]);

<div
  className="zoom"
  onPointerEnter={() => !dismissed && setOpen(true)}
  onPointerLeave={() => {
    setOpen(false);
    setDismissed(false);
  }}
>
  <img src={src} alt={alt} />
  {open && (
    <div className="zoom-pane" style={{ backgroundImage: `url(${src})` }} />
  )}
</div>;
```

Render the pane inside the element that has the pointer handlers, so moving onto it does not count as leaving.

## What to verify

- Rest the pointer on the trigger, then press Escape without moving: the popup closes.
- Move the pointer from the trigger onto the popup: it stays.
- Leave the pointer still for a minute: it stays.
