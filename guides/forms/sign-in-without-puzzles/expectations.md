# Expectations: sign-in-without-puzzles

1. Signing in needs no puzzle: with only the email and password filled in, signing in succeeds; or a control does the check for the user (such as "Fill letters for me") and signing in then succeeds; or the form offers another way in (such as an emailed sign-in link) that needs no puzzle.
2. The password field carries `autocomplete="current-password"`, the email field `username` or `email`, and pasting into the password field works.
