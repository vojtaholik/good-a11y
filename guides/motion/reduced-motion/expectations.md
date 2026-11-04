# Expectations: reduced-motion

1. With `prefers-reduced-motion: reduce` emulated, the page's text does not change on its own within 10 seconds of load (carousels and tickers do not advance).
2. Without reduced motion, when the page's text changes on its own (auto-advancing content), a visible button named with "pause" or "stop" is reachable with focus, and after activating it the text does not change for 10 seconds.
3. With `prefers-reduced-motion: reduce` emulated, the computed `scroll-behavior` of the root and body elements is `auto`.
4. With `prefers-reduced-motion: reduce` emulated, scrolling through the page starts no running animation of `transform`, `translate`, `scale` or `rotate`, and no element's computed `transform` changes.
5. With reduced motion emulated, after scrolling through the page every heading (h1 to h3) and image in `main` is visible (not left hidden or at opacity 0 by an entrance effect).
