# Expectations: custom-select

1. The control has role `combobox` (a native `select` or the select-only combobox pattern) and its accessible name equals its visible label text.
2. When the control is a native `select`, clicking its visible label moves focus to it.
3. With the control focused, pressing Arrow Down (and, if that only opens the list, Arrow Down then Enter) changes the value the control exposes.
4. The control is reached with Tab, and no option is a separate Tab stop.
5. Changing the value does not navigate away or move focus off the control.
