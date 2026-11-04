---
name: Time limits and timeout warnings
description: Cart holds, reservations, session timeouts, auto sign-out and countdowns. Warn before time runs out and let people extend it with one simple action
criteria:
  - STD-SC-2.2.1
---

# Time limits and timeout warnings

## When to use

Any time limit the page sets: a cart or ticket hold, a seat or room reservation, a session that signs out when idle, a quiz timer, a form that expires, an offer countdown that changes what the user can do. Not for a toast's display time; that has its own rule in the status messages guide.

## The rule agents break: the timer just runs out

"Hold the cart for 15 minutes, then empty it" gets a `setTimeout` that empties the cart, and the result does what was asked. People who read slowly, use a screen reader, switch, voice control or a magnifier, or get interrupted lose their cart without notice. For each time limit, at least one of these must hold:

- The user can **turn it off** before it starts.
- The user can **adjust** it to at least ten times the default.
- The user is **warned before it ends** and gets at least 20 seconds to extend it with one simple action, such as pressing a button, and can extend it at least ten times.

Exceptions are real-time events (an auction ending), a limit that is essential to the activity, and limits over 20 hours.

For a hold or session, build the warning: show it well before the end (one or two minutes for a 15 minute hold), with a button that restarts the full time. Do it even when the request only describes the expiry, and say in your reply why you added it.

## Warning with extend

```html
<div id="hold-warning" role="alert" hidden>
  <p>Your cart is held for <span id="hold-left">2 minutes</span> more.</p>
  <button type="button" id="extend">Keep my items for 15 more minutes</button>
</div>
```

```js
const HOLD_MS = 15 * 60 * 1000;
const WARN_MS = 2 * 60 * 1000;
let warnTimer;
let endTimer;

function startHold() {
  clearTimeout(warnTimer);
  clearTimeout(endTimer);
  warning.hidden = true;
  warnTimer = setTimeout(() => {
    warning.hidden = false;
  }, HOLD_MS - WARN_MS);
  endTimer = setTimeout(expire, HOLD_MS);
}

document.getElementById("extend").addEventListener("click", startHold);
```

- `role="alert"` is rendered empty or hidden at load and announced when it appears, without moving focus.
- The button restarts the whole hold, every time it is pressed; there is no cap below ten.
- Do not update a visible countdown every second inside a live region; announce only the warning.

## DO

- Keep the warning visible until the user acts or time runs out.
- Say what happens at the end: "Then the items go back in stock."
- After expiry, say what happened and how to recover ("Add them again").
- Count from a stored deadline (`Date.now() + HOLD_MS`) so the timer survives re-renders and tab switches.

## DO NOT

- Do not end a hold, sign the user out or clear a form without a warning first.
- Do not put the only extend control in a toast that disappears.
- Do not require typing or a puzzle to extend.

## React and frameworks

Keep the deadline in state and derive the phase from it.

```jsx
const [deadline, setDeadline] = useState(null);
const [warning, setWarning] = useState(false);

useEffect(() => {
  if (deadline === null) return;
  const left = deadline - Date.now();
  setWarning(left <= WARN_MS);
  const warn = setTimeout(() => setWarning(true), Math.max(0, left - WARN_MS));
  const end = setTimeout(onExpire, Math.max(0, left));
  return () => {
    clearTimeout(warn);
    clearTimeout(end);
  };
}, [deadline]);

const extend = () => setDeadline(Date.now() + HOLD_MS);
```

Render the alert container always, and its content only when `warning` is true.

## What to verify

- Start the hold and wait (or shorten the constants): the warning appears with time left, and a screen reader announces it.
- Press extend: the warning goes, and the hold runs its full length again. Repeat: it extends again.
- Let it run out: the page says what happened.
