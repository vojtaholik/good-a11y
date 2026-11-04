# Expectations: menu-button

1. The trigger is a `button` with `aria-haspopup` of `menu` or `true` and `aria-expanded="false"` while the menu is closed.
2. Pressing Arrow Down on the focused trigger opens an element with role `menu`, sets `aria-expanded="true"` and focuses its first `menuitem`.
3. Pressing Arrow Down on the last menu item moves focus to the first item; Arrow Up on the first moves to the last.
4. Pressing Escape in the open menu closes it, sets `aria-expanded="false"` and focuses the trigger.
5. Menu items are not in the Tab order: pressing Tab in the open menu closes the menu and focus leaves it.
6. Pressing Enter on a menu item runs its action, closes the menu and focuses the trigger.
