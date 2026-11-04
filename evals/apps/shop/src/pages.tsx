import { useState, type FormEvent } from "react";

import type { CartAction, CartLine } from "./cart";
import { formatPrice, products, type Product } from "./data";
import { QuickView } from "./QuickView";
import { Link, navigate } from "./router";

export function ShopPage({ onAdd }: { onAdd: (product: Product) => void }) {
  const [preview, setPreview] = useState<Product | null>(null);

  return (
    <>
      <h1>Outdoor gear</h1>
      <p className="lede">
        Kit we use ourselves, shipped from Brno within two days.
      </p>
      <ul className="product-grid">
        {products.map((product) => (
          <li key={product.id} className="product-card">
            <h2>{product.name}</h2>
            <p className="category">{product.category}</p>
            <p className="price">{formatPrice(product.price)}</p>
            <div className="actions">
              <button type="button" onClick={() => onAdd(product)}>
                Add to cart
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setPreview(product)}
              >
                Quick view
              </button>
            </div>
          </li>
        ))}
      </ul>
      <QuickView
        product={preview}
        onClose={() => setPreview(null)}
        onAdd={(product) => {
          onAdd(product);
          setPreview(null);
        }}
      />
    </>
  );
}

const lineProduct = (line: CartLine) =>
  products.find((product) => product.id === line.productId);

export const cartTotal = (lines: CartLine[]) =>
  lines.reduce(
    (sum, line) => sum + (lineProduct(line)?.price ?? 0) * line.quantity,
    0
  );

export function CartPage({
  lines,
  dispatch,
}: {
  lines: CartLine[];
  dispatch: (action: CartAction) => void;
}) {
  if (lines.length === 0) {
    return (
      <>
        <h1>Your cart</h1>
        <p>Your cart is empty.</p>
        <p>
          <Link to="/">Continue shopping</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Your cart</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Quantity</th>
            <th scope="col">Price</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const product = lineProduct(line);
            if (!product) return null;
            return (
              <tr key={line.productId}>
                <td>{product.name}</td>
                <td>
                  <div className="quantity">
                    <button
                      type="button"
                      className="secondary"
                      onClick={() =>
                        dispatch({ type: "decrement", productId: product.id })
                      }
                    >
                      Less
                    </button>
                    <span>{line.quantity}</span>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() =>
                        dispatch({ type: "increment", productId: product.id })
                      }
                    >
                      More
                    </button>
                  </div>
                </td>
                <td>{formatPrice(product.price * line.quantity)}</td>
                <td>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() =>
                      dispatch({ type: "remove", productId: product.id })
                    }
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="total">Total: {formatPrice(cartTotal(lines))}</p>
      <div className="actions">
        <button type="button" onClick={() => navigate("/checkout")}>
          Go to checkout
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => dispatch({ type: "clear" })}
        >
          Empty cart
        </button>
      </div>
    </>
  );
}

export function CheckoutPage({
  lines,
  onPlaced,
}: {
  lines: CartLine[];
  onPlaced: () => void;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onPlaced();
    navigate("/order-placed");
  };

  return (
    <>
      <h1>Checkout</h1>
      <p>
        {lines.length} {lines.length === 1 ? "item" : "items"}, total{" "}
        {formatPrice(cartTotal(lines))}
      </p>
      <form className="checkout" onSubmit={submit}>
        <h2>Contact</h2>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" />
        </div>
        <h2>Delivery address</h2>
        <div className="field">
          <label htmlFor="street">Street and number</label>
          <input id="street" name="street" type="text" />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <input id="city" name="city" type="text" />
        </div>
        <div className="field">
          <label htmlFor="postal">Postal code</label>
          <input id="postal" name="postal" type="text" />
        </div>
        <div className="field">
          <label htmlFor="country">Country</label>
          <input id="country" name="country" type="text" />
        </div>
        <button type="submit">Place order</button>
      </form>
    </>
  );
}

export function OrderPlacedPage() {
  return (
    <>
      <h1>Thank you</h1>
      <p>Your order is on its way. We sent a confirmation to your email.</p>
      <p>
        <Link to="/">Back to the shop</Link>
      </p>
    </>
  );
}

export function NotFoundPage() {
  return (
    <>
      <h1>Page not found</h1>
      <p>
        <Link to="/">Go to the shop</Link>
      </p>
    </>
  );
}
