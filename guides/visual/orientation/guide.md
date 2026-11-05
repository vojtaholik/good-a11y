---
name: Screen orientation
description: Portrait-only or landscape-only layouts, "rotate your device" or "turn your phone upright" overlays and screen.orientation.lock. The page must work with the device held either way
criteria:
  - STD-SC-1.3.4
---

# Screen orientation

## When to use

Any request to lock a page, app or game to portrait or landscape, to show "Please turn your phone upright" or "Rotate your device" when it is turned, or to call `screen.orientation.lock()`. Also when a layout was only designed for one orientation and breaks in the other.

## The rule agents break: the request asks for the lock

Some people cannot turn their device. A tablet or phone mounted on a wheelchair or a bed arm stays the way it is mounted. A page that covers itself with "turn your phone upright", or that only works one way round, shuts them out completely. So do not build the lock, even when the request asks for it: make the layout work in both orientations, and tell the user in your reply why you did that instead. This is the one part of such a request to override.

The only exception is a page whose purpose needs one orientation: a piano keyboard, a cheque deposit camera, a VR view. A shop, an article, a form or a dashboard never needs it.

## Make the other orientation work instead

A phone held sideways is about 390 px tall. Fit the layout to that height:

```css
@media (orientation: landscape) and (max-height: 500px) {
  .site-header {
    position: static;
  }
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  }
  .hero {
    max-height: 40vh;
  }
}
```

- Let the page scroll. Fixed headers, footers and bars eat most of a 390 px screen; make them static or shorter in a short landscape view.
- Size full-height sections with `min-height: 100dvh`, not a fixed `height`, so content is not cut off.
- Keep every control reachable without rotating: nothing fixed may cover the content.

## DO

- Lay out with flexible grids (`auto-fill`, `minmax`) that reflow when the width and height swap.
- Test both ways: a phone at 390 x 844 and at 844 x 390.
- In your reply, say that the page works both ways and why a lock was not added.

## DO NOT

- Do not show a "rotate your device", "turn your phone upright" or "best viewed in portrait" overlay that hides the page.
- Do not call `screen.orientation.lock()`, and do not set `"orientation"` in a web app manifest to lock a page that does not need it.
- Do not rotate the page with a CSS transform to fake the other orientation.
- Do not hide content or controls with `@media (orientation: landscape)` and `display: none`.

## What to verify

- With a phone held sideways (844 x 390), the main content and its controls are visible and work, and nothing covers them.
- No message asks to turn the device, in either orientation.
