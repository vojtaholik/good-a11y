# Expectations: custom-select

1. The control has role `combobox` (a native `select` or the select-only combobox pattern) and its accessible name equals its visible label text.
2. Clicking the visible label moves focus to the control.
3. With the control focused, pressing Arrow Down (opening and then choosing with Enter for the custom pattern) changes the selected value, and the control exposes the new value.
4. The control is reached with Tab, and no option is a separate Tab stop.
5. Changing the value does not navigate away or move focus off the control.
