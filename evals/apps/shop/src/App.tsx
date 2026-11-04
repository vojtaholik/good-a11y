import { useEffect, useReducer } from "react";

import { cartReducer } from "./cart";
import type { Product } from "./data";
import {
  CartPage,
  CheckoutPage,
  NotFoundPage,
  OrderPlacedPage,
  ShopPage,
} from "./pages";
import { Link, usePath } from "./router";

const titles: Record<string, string> = {
  "/": "Fjell Outdoor",
  "/cart": "Cart - Fjell Outdoor",
  "/checkout": "Checkout - Fjell Outdoor",
  "/order-placed": "Order placed - Fjell Outdoor",
};

export function App() {
  const path = usePath();
  const [lines, dispatch] = useReducer(cartReducer, []);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const add = (product: Product) =>
    dispatch({ type: "add", productId: product.id });

  useEffect(() => {
    document.title = titles[path] ?? "Page not found - Fjell Outdoor";
  }, [path]);

  const page =
    path === "/" ? (
      <ShopPage onAdd={add} />
    ) : path === "/cart" ? (
      <CartPage lines={lines} dispatch={dispatch} />
    ) : path === "/checkout" ? (
      <CheckoutPage
        lines={lines}
        onPlaced={() => dispatch({ type: "clear" })}
      />
    ) : path === "/order-placed" ? (
      <OrderPlacedPage />
    ) : (
      <NotFoundPage />
    );

  return (
    <>
      <header className="site-header">
        <Link to="/" className="logo">
          Fjell Outdoor
        </Link>
        <nav>
          <ul>
            <li>
              <Link to="/">Shop</Link>
            </li>
            <li>
              <Link to="/cart">Cart ({count})</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>{page}</main>
      <footer className="site-footer">
        <p>Fjell Outdoor, Brno. Free returns within 30 days.</p>
      </footer>
    </>
  );
}
