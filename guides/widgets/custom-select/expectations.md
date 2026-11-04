# Expectations: custom-select

1. The control has role `combobox` (a native `select` or the select-only combobox pattern) and its accessible name equals its visible label text.
2. When the control is a native `select`, clicking its visible label moves focus to it.
3. With the control focused, the keyboard changes the value the control exposes: on a native `select`, typing the first letter of another option; on a custom one, Arrow Down (and, if that only opens the list, Arrow Down then Enter). Arrow Down on a native `select` opens the picker on macOS without changing the value, so it is not the test there.
4. The control is reached with Tab, and no option is a separate Tab stop.
5. Changing the value does not navigate away or move focus off the control.
