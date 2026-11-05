---
name: Moving content that starts on its own
description: Tickers, marquees, scrolling logo strips, auto-advancing carousels, animated backgrounds and looping banners. Nothing may keep moving on its own for more than 5 seconds, also when the request asks for a continuous ticker
criteria:
  - STD-SC-2.2.2
---

# Moving content that starts on its own

## When to use

Any request for a ticker, a marquee, a scrolling strip of logos or brands, an announcement bar that slides text across, an auto-advancing carousel or slideshow, a looping animated background or hero, or any CSS animation with `infinite`.

## The rule agents break: a Pause button is not enough

Motion that never stops pulls the eye away from the text next to it. People with attention or reading difficulties lose their place, and some get dizzy or sick. The usual fix, an infinite animation with a Pause button, still makes them find and press the button before they can read.

WCAG 2.2 success criterion 2.2.2 (Pause, Stop, Hide) accepts that Pause button. The WCAG 3 Working Draft of 10 September 2026 goes further: its core requirement 2.6.1.3 "No visual motion" says content does not include motion lasting longer than 5 seconds, unless the motion is essential. WCAG 3 is a draft, not law or a standard yet. A page built to this guide meets both: it stops on its own within 5 seconds, so 2.2.2 holds too.

So build the moving part to stop within 5 seconds, also when the request says "continuously" or "like a ticker", and tell the user in your reply why it stops. A ticker of brands, news or offers is never essential motion.

## Build it to stop

Show the items as a static, wrapping row. If the request wants motion, give it one short pass that ends in that static row:

```css
.brand-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  list-style: none;
  padding: 0;
}

@media (prefers-reduced-motion: no-preference) {
  .brand-strip li {
    animation: slide-in 0.6s ease-out both;
    animation-delay: calc(var(--i) * 0.3s);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(2rem);
  }
}
```

- Count the total: delay of the last item plus its duration must end before 5 seconds. Six items at 0.3 s steps plus 0.6 s end at 2.1 s.
- A carousel does not advance on its own. It shows one slide and has Previous and Next buttons. If it must advance, it stops after the last slide and within 5 seconds of the page opening.
- A looping background video or animation plays once, or for at most 5 seconds, then stays on a still frame.
- A replay button may run the motion again, for under 5 seconds each time.
- Keep everything that moved readable and reachable once it stops: no clipped overflow, no item that exists only mid-animation.

## DO

- End every animation that starts on its own within 5 seconds: a finite `animation-iteration-count`, a timer that stops a script, or no motion at all.
- Wrap the motion in `@media (prefers-reduced-motion: no-preference)` so people who asked for less motion get the static row from the start.
- In your reply, say that the strip stops after one pass and why.

## DO NOT

- Do not use `animation-iteration-count: infinite` or a `setInterval` that keeps moving content.
- Do not rely on a Pause button, a pause on hover or `prefers-reduced-motion` alone for motion that otherwise runs forever.
- Do not duplicate the list to make a seamless loop: screen readers then read every item twice.
- Do not use the `<marquee>` element.

## What to verify

- Open the page and wait 6 seconds without touching anything: nothing on the page is still moving.
- Every item of the strip is visible and readable once it stops, at 320 px wide too.
