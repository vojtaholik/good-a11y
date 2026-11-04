---
name: Sign-in without puzzles
description: Sign-in, login, CAPTCHA and bot checks. No typing distorted letters, solving puzzles or remembering codes to get in; allow paste and password managers
criteria:
  - STD-SC22-3.3.8
---

# Sign-in without puzzles

## When to use

Any sign-in, login, sign-up or account recovery step, and any bot check on it: "type the letters in the image", a math question, a slider puzzle, "pick all the traffic lights", a code the user must copy by hand, a security question. Also when the request itself asks for such a check.

## The rule agents break: building the puzzle that was asked for

"Keep bots out with five distorted letters" is easy to build, and the result looks right. It locks people out. Transcribing distorted text, solving a puzzle, recalling a code or doing sums is a cognitive function test, and no step of signing in may depend on one alone. Someone with dyslexia, a memory or learning disability, low vision or a screen reader cannot pass it.

A step may use such a test only when it also offers at least one of:

- **Another way** in that needs no test, such as an emailed sign-in link or a passkey.
- **Help** that does the work: the password field accepts paste and the password manager's autofill, and a code field accepts paste.
- **Object recognition** or **personal content** the user gave earlier, such as "pick the photo you uploaded". This is the weakest choice; avoid it.

When asked for a letters puzzle, keep bots out without it: a hidden honeypot field, rate limits on the server, or a service's invisible check. If the user insists on a visible challenge, add an equal way past it ("Email me a sign-in link"), and say in your reply why.

## The sign-in form

```html
<form id="sign-in" novalidate>
  <label for="email">Email</label>
  <input
    id="email"
    name="email"
    type="email"
    autocomplete="username"
    required
  />

  <label for="password">Password</label>
  <input
    id="password"
    name="password"
    type="password"
    autocomplete="current-password"
    required
  />

  <div class="trap" aria-hidden="true">
    <label for="website">Leave this empty</label>
    <input id="website" name="website" tabindex="-1" autocomplete="off" />
  </div>

  <button type="submit">Sign in</button>
  <button type="button" id="email-link">Email me a sign-in link</button>
</form>
```

```css
.trap {
  position: absolute;
  left: -10000px;
}
```

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (form.website.value !== "") return;
  signIn(form.email.value, form.password.value);
});
```

- `autocomplete="username"` on the email and `current-password` on the password let password managers fill both. Use `new-password` on sign-up.
- The honeypot is off screen, out of the Tab order and hidden from screen readers; bots fill it, people do not.

## DO

- Allow paste in every sign-in field, including one-time code fields (`autocomplete="one-time-code"`).
- Offer "Show password" as a toggle button that switches `type` between `password` and `text`.
- Let a code field take the whole code in one input, not one character per box.

## DO NOT

- Do not block paste with `onpaste="return false"` or `preventDefault()` on paste.
- Do not ask for the password twice at sign-in, or for characters 3, 5 and 8 of it.
- Do not set `autocomplete="off"` on the email or password.
- Do not make a typed puzzle, sums or a slider the only way in.

## React and frameworks

Use `autoComplete="username"` and `autoComplete="current-password"`. Keep the honeypot uncontrolled or controlled like any field, and check it in `onSubmit`. Do not attach `onPaste` handlers that call `preventDefault()`. If a CAPTCHA library is required, pick one with an invisible or no-interaction mode.

## What to verify

- Sign in with only email and password, filled by the password manager or pasted: it works.
- No step asks the user to type what an image shows, solve sums or remember a code, unless another way past it is on the same page.
