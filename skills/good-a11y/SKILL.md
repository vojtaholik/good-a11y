---
name: good-a11y
description: MANDATORY before you write or change UI. Use whenever you build or edit HTML, components, forms, dialogs, menus, tabs, navigation, focus handling, ARIA, motion or images, in any framework, even if nobody mentions accessibility.
---

# good-a11y

Accessibility guides for the things agents get wrong, and a checker for your own page. Run every command as `npx -y github:vojtaholik/good-a11y <command>`.

Use it for: forms and validation, dialogs and popovers, menus, tabs, accordions, comboboxes, custom selects, navigation and skip links, route changes, toasts, icon buttons, focus styles, motion, images.

Do not use it for: backend code, build config, copy edits with no markup, styling that adds no interactive element.

## The loop

1. `search "<2-5 words>"` names the task, such as `search "modal dialog focus"`. It prints `[{id, description}]`.
2. `retrieve "<id>[,<id>]"` prints the guides. When it prints a file path, read that file.
3. Build with them. Follow every DO and DO NOT.
4. `check <url>` on your running page, `localhost` included.
5. Fix each issue it lists with the guide it names, then check again.

`list` prints every guide.

## In your answer

End with:

### Accessibility guidance used

- `<guide id>`: what it changed in your code
- `check`: its verdict, or why you could not run it
