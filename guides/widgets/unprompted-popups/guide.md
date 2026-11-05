---
name: Popups that open on their own
description: Newsletter popups, cookie and consent banners, promo overlays, chat invitations and any popup that opens on a timer, on scroll or on page load. They do not take focus, they do not block the page, and they can be dismissed
criteria:
  - STD-SC-2.4.3
  - STD-SC-2.1.2
---

# Popups that open on their own

## When to use

Any popup or banner that appears without the person asking for it: a newsletter signup after a few seconds, a cookie or consent banner on the first visit, a discount offer on scroll or exit, a chat invitation, an app-install banner. For a dialog the person opens with a button, use `dialog-modal` instead.

## The rule agents break: `showModal()` on a timer

The usual build opens the popup with `dialog.showModal()` or moves focus into it with `.focus()`. Someone using a keyboard or a screen reader is somewhere in the page when it fires. Their focus jumps away, the page behind goes inert, and a screen reader starts reading something they did not ask for. They lose their place and may not know how they got there.

The WCAG 3 Working Draft of 10 September 2026 makes this explicit: its core requirement 2.4.1.8 "Focus user-controlled" says keyboard focus only moves as a result of user interaction (its exceptions are narrow: focus moving to the next field of a one-time code, a security or emergency warning such as an imminent session timeout, or a move the person was told about and could avoid), and core requirement 2.7.4.1 "Overlay content dismissible" says new content that covers the main content can be dismissed. WCAG 3 is a draft, not law or a standard yet. A popup built to this guide also meets WCAG 2.2: the focus order stays meaningful (2.4.3) and nothing traps the keyboard (2.1.2).

So a popup that opens on its own is non-modal, takes no focus and has a close button. A dialog the person opened by pressing a button still moves focus into itself: the person asked for it.

## Build it non-modal

```html
<aside class="newsletter" aria-labelledby="newsletter-title" hidden>
  <h2 id="newsletter-title">Get new trail notes</h2>
  <form>
    <label for="newsletter-email">Email</label>
    <input id="newsletter-email" type="email" autocomplete="email" />
    <button type="submit">Subscribe</button>
  </form>
  <button type="button" class="newsletter-close">Close</button>
</aside>
```

```js
setTimeout(() => {
  popup.hidden = false;
}, 3000);

closeButton.addEventListener("click", () => {
  popup.hidden = true;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !popup.hidden) {
    popup.hidden = true;
  }
});
```

- Use `<aside>` or `<section>` with `aria-labelledby` pointing at its heading, so a screen reader can find it in the landmarks list. Use `<dialog>` only with `show()`, never `showModal()`, and give it `aria-labelledby` too.
- Put it where the keyboard reaches it soon: early in the page's source order, or right after the element that had focus when it opened. Position it on screen with CSS.
- Do not cover the page's main content with it. A corner card or a bar at the bottom works. If it must cover content, it still needs the close button and Escape.
- When it closes, if focus was inside it, put focus back on the element the person used before, or on the start of `main`.

## Cookie and consent banners

A consent banner is the most common popup that opens on its own, and the same rules hold:

- Show it as a non-modal bar, at the bottom or the top, and do not move focus into it on load.
- Put its markup first in `<body>`, so the first Tab reaches it, even when CSS places it at the bottom.
- Give Accept and Reject the same kind of control and the same prominence, both as `<button>`, both reachable by Tab. A settings link or button is fine beside them.
- Make sure it does not cover the element that has focus: add `scroll-padding-bottom` (or `scroll-padding-top` for a top bar) equal to its height to `html`, so focused elements scroll clear of it.
- Do not make the page inert or block scrolling until the person answers.

## DO

- Show the popup with `hidden = false`, `popover` with `popover="manual"` and `showPopover()`, or `dialog.show()`.
- Give it a heading, a name through `aria-labelledby`, and a visible Close button, and let Escape close it.
- Keep focus where it was when the popup appears.
- In your reply, say that the popup does not take focus or block the page, and why.

## DO NOT

- Do not call `showModal()`, `.focus()` or set `autofocus` inside a popup that opens on its own.
- Do not add `inert`, `aria-hidden="true"` or `overflow: hidden` on the body to the page behind it.
- Do not trap Tab inside it.
- Do not leave it without a way to dismiss it.

## What to verify

- Tab to a link in the page, wait for the popup: focus is still on that link.
- With the popup open, Tab still moves through the page, and no element of the page is inert.
- The popup has a name, and its Close button or Escape hides it.
