import * as stylex from "@stylexjs/stylex";

export const colors = stylex.defineVars({
  "--accent": "oklch(43.19% 0.1875 266.92)",
  "--accent-hover": "oklch(36.48% 0.1586 267.05)",
  "--accent-soft": "oklch(94.42% 0.0193 273.23)",
  "--bg": "oklch(97.23% 0.0040 106.47)",
  "--control": "oklch(56.85% 0.0132 264.46)",
  "--focus": "oklch(20.47% 0.0104 268.17)",
  "--focus-inverse": "oklch(100.00% 0 none)",
  "--ink": "oklch(20.47% 0.0104 268.17)",
  "--ink-muted": "oklch(43.78% 0.0177 264.38)",
  "--inverse": "oklch(20.47% 0.0104 268.17)",
  "--inverse-control": "oklch(66.49% 0.0163 260.72)",
  "--inverse-deep": "oklch(15.93% 0.0066 270.98)",
  "--inverse-line": "oklch(43.78% 0.0177 264.38)",
  "--issue": "oklch(47.49% 0.1739 31.19)",
  "--issue-soft": "oklch(95.38% 0.0172 35.34)",
  "--line": "oklch(87.98% 0.0082 114.24)",
  "--notice": "oklch(46.24% 0.0989 72.22)",
  "--notice-soft": "oklch(96.88% 0.0372 88.46)",
  "--ok": "oklch(46.91% 0.1065 151.82)",
  "--ok-soft": "oklch(95.27% 0.0174 153.56)",
  "--on-accent": "oklch(100.00% 0 none)",
  "--on-inverse": "oklch(100.00% 0 none)",
  "--on-inverse-muted": "oklch(79.76% 0.0121 264.50)",
  "--sunken": "oklch(94.77% 0.0066 106.53)",
  "--surface": "oklch(100.00% 0 none)",
});

export const font = stylex.defineVars({
  "--font-code":
    "'Atkinson Hyperlegible Mono Variable', ui-monospace, monospace",
  "--font-text": "'Atkinson Hyperlegible Next Variable', system-ui, sans-serif",
});

export const size = stylex.defineVars({
  "--size-display": "clamp(2.25rem, 1.5rem + 3vw, 3.5rem)",
  "--size-lg": "1.375rem",
  "--size-md": "1.125rem",
  "--size-sm": "1rem",
  "--size-xl": "1.75rem",
  "--size-xs": "0.875rem",
  "--size-xxl": "2.25rem",
});

export const space = stylex.defineVars({
  "--s1": "4px",
  "--s2": "8px",
  "--s3": "12px",
  "--s4": "16px",
  "--s5": "24px",
  "--s6": "32px",
  "--s7": "48px",
  "--s8": "64px",
  "--s9": "96px",
});

export const radius = stylex.defineVars({
  "--radius-lg": "12px",
  "--radius-md": "8px",
  "--radius-pill": "999px",
  "--radius-sm": "4px",
});

export const focus = stylex.defineVars({
  "--focus-offset": "3px",
  "--focus-width": "3px",
});

export const layout = stylex.defineVars({
  "--gutter": "clamp(16px, 4cqi, 48px)",
  "--measure": "68ch",
  "--page": "1200px",
  "--target": "44px",
  "--target-min": "24px",
});
