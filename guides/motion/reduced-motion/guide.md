---
name: Reduced motion and moving content
description: Respect prefers-reduced-motion in CSS and JavaScript animations, and give carousels and autoplay a pause control
criteria:
  - STD-SC-2.2.2
  - STD-SC-2.3.1
---

# Reduced motion and moving content

## When to use

Any animation, transition, parallax, smooth scrolling, auto-advancing carousel, marquee, autoplaying video or animated background. Two separate jobs:

1. **Moving content that starts by itself** and lasts more than five seconds (carousels, tickers, background video, animated illustrations) needs a visible way to pause, stop or hide it. This applies to everyone, whatever their settings.
2. **The user's reduced motion setting** (`prefers-reduced-motion: reduce`, set in the operating system) asks for less movement. People with vestibular disorders get dizzy or nauseous from large movement, zoom and parallax. Honor it in CSS and in JavaScript.

Separately, keep any flashing to at most three flashes in any one second, unless the flashes are small and dim enough to stay below the general and red flash thresholds.

## CSS: reduce, do not just delete

```css
.panel {
  transition:
    transform 300ms ease,
    opacity 300ms ease;
}
.panel[data-state="closed"] {
  transform: translateY(1rem);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .panel {
    transition: opacity 150ms linear;
  }
  .panel[data-state="closed"] {
    transform: none;
  }
}

html {
  scroll-behavior: smooth;
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

Replace movement (slide, zoom, spin, parallax) with a short fade or an instant change. Fades and color changes are fine; it is motion across the screen that triggers symptoms. You can also write motion only for users who did not ask for less: `@media (prefers-reduced-motion: no-preference) { ... }`.

## JavaScript animations and autoplay

```js
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

function scrollToSection(el) {
  el.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth" });
}

reduce.addEventListener("change", () => {
  if (reduce.matches) carousel.pause();
});
```

Check the query at the moment you animate (or listen for `change`); users can switch it while the page is open. Web Animations, GSAP, Motion and similar libraries do not read the setting for you unless you configure them to.

## Carousels and auto-advance

- Do not auto-advance when reduced motion is set.
- Otherwise, give a visible Pause button as the first control of the carousel, and keep it a real `<button>` with a name that matches its action ("Pause slides" / "Play slides", or a fixed name with `aria-pressed`).
- Pause on hover and on keyboard focus inside the carousel, and do not resume on its own after the user paused.
- Do not use a live region for slide changes while auto-advancing; it talks over everything. Use `aria-live="polite"` on the slide container only when auto-advance is off.

## DO

- Ship `<video>` backgrounds without `autoplay` when reduced motion is set, or with a visible pause button in all cases.
- Keep animations short (under 300 ms for UI feedback) and avoid large scale and rotation even without the setting.
- Test with the setting on: macOS Accessibility, Display, Reduce motion; Windows Settings, Accessibility, Visual effects, Animation effects off; or DevTools rendering emulation.

## DO NOT

- Do not use a global `* { animation: none !important; transition: none !important; }` as your only handling. Code waiting for `animationend` or `transitionend` then never runs, and menus stop opening. Handle motion per component; if you add a safety net, use `animation-duration: 1ms; animation-iteration-count: 1; transition-duration: 1ms;` so end events still fire.
- Do not autoplay animated GIFs that loop forever; show a still with a play control.
- Do not use parallax or scroll-linked zoom without a reduced motion fallback.
- Do not flash content (alerts, game effects, video intros) more than three times per second.

## React and frameworks

Read the setting in a hook backed by `matchMedia` and its `change` event, and pass it to your animation library (Motion's `useReducedMotion`, or a global config such as `MotionConfig reducedMotion="user"`). Server rendering cannot know the setting; render the reduced version or the static first frame by default and start motion after mount.

## What to verify

- With reduced motion emulated: no element moves across the screen, carousels do not advance, smooth scrolling is off, and every feature still works.
- Without it: every auto-moving thing has a visible pause control reachable by keyboard, and pausing sticks.
- Nothing flashes more than three times a second.
