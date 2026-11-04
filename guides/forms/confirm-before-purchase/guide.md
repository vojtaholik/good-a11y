---
name: Confirm before a purchase or booking
description: One-click buy, "Buy now", instant booking, payment, subscription and delete actions need a review and confirm step or a way to cancel or undo afterwards
criteria:
  - STD-SC-3.3.4
---

# Confirm before a purchase or booking

## When to use

Any action that spends money, books, subscribes, signs or agrees to something, or deletes or overwrites the user's data: "Buy now", one-click order, instant booking, "Pay", "Subscribe", "Delete account", "Delete all", submitting a test. Also when the request says "straight away", "in one click" or "skip the checkout".

## The rule agents break: one click that cannot be taken back

A "Buy now" button that places the order on the first click works, and it is exactly what was asked. It is wrong anyway. A tremor, a voice-control command heard wrong, a screen reader user exploring the page or a mistaken tap orders the item for real. At least one of these must hold:

1. **Reversible**: the order or booking can be cancelled from the page that confirms it.
2. **Checked**: entered data is checked and the user can correct it before it is final.
3. **Confirmed**: a review step shows what will happen and asks the user to confirm.

The simplest fit for "buy straight away" is a small confirm step: one click opens it, a second click places the order. It still skips the cart and checkout. Do it even when the request says "straight away", and say in your reply why you added it.

## Confirm with a dialog

```html
<button type="button" class="buy-now" data-product="rain-jacket">
  Buy now
</button>

<dialog id="confirm-order" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Confirm your order</h2>
  <p id="confirm-summary">
    Rain jacket, €189.00, to Jana Nováková, Hlavní 1, Brno.
  </p>
  <form method="dialog">
    <button value="cancel">Cancel</button>
    <button value="place" autofocus>Place order for €189.00</button>
  </form>
</dialog>
```

```js
const dialog = document.getElementById("confirm-order");

document.querySelector(".buy-now").addEventListener("click", () => {
  dialog.showModal();
});

dialog.addEventListener("close", () => {
  if (dialog.returnValue === "place") {
    placeOrder();
  }
});
```

- The summary names the item, the price and where it goes, so the user can catch a wrong address.
- The confirm button says what it does and how much: "Place order for €189.00", not "OK".
- Cancel and Escape close it with nothing ordered.

## Or let it be cancelled

When a confirm step is really unwanted, place the order and show a "Cancel order" button on the confirmation page that works for a stated time ("You can cancel within 30 minutes"). A toast with "Undo" that disappears in seconds is not enough: keyboard and screen reader users may not reach it.

## DO

- Show the total, the item and the delivery or billing details in the review.
- Keep the user's data when they cancel or go back.
- Ask for a second step on delete too: "Delete 3 saved addresses?" with "Delete" and "Keep them".

## DO NOT

- Do not place an order, book or charge on a single click with no cancel.
- Do not use `window.confirm()`; it cannot show a proper summary and some browsers suppress it.
- Do not make the confirm button the one that looks like the default when the action deletes data.

## React and frameworks

Keep a `pending` state between the two clicks.

```jsx
const [pending, setPending] = useState(null);

<button type="button" onClick={() => setPending(product)}>
  Buy now
</button>;

{
  pending && (
    <ConfirmDialog
      title="Confirm your order"
      summary={`${pending.name}, ${formatPrice(pending.price)}, to ${saved.name}, ${saved.address}`}
      confirmLabel={`Place order for ${formatPrice(pending.price)}`}
      onConfirm={() => {
        placeOrder(pending);
        setPending(null);
        navigate("/order-placed");
      }}
      onCancel={() => setPending(null)}
    />
  );
}
```

Build `ConfirmDialog` on the native `<dialog>` with `showModal()` so focus moves into it and Escape closes it.

## What to verify

- Click "Buy now" (or the booking button): nothing is ordered yet, and the review shows what and how much.
- Cancel, or press Escape: still nothing ordered.
- Confirm: the order is placed, or, without a confirm step, the confirmation page offers "Cancel order" and it works.
