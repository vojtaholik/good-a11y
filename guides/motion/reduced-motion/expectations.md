# Expectations: reduced-motion

1. With `prefers-reduced-motion: reduce` emulated, an auto-advancing carousel or ticker does not change its visible slide within 10 seconds of load.
2. Without reduced motion, auto-moving content has a visible `button` reachable with Tab that stops the movement; after activating it, the visible slide does not change for 10 seconds.
3. With `prefers-reduced-motion: reduce` emulated, the computed `scroll-behavior` of the root element is `auto`.
4. With `prefers-reduced-motion: reduce` emulated, elements that animate on open or reveal have no computed `transform` other than `none` during the animation (only opacity or color may change).
5. With reduced motion emulated, every control in the page still works: activating a reveal or open control still shows its content.
