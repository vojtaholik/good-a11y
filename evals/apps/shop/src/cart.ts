export type CartLine = { productId: string; quantity: number };

export type CartAction =
  | { type: "add"; productId: string }
  | { type: "increment"; productId: string }
  | { type: "decrement"; productId: string }
  | { type: "remove"; productId: string }
  | { type: "clear" };

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "add":
    case "increment": {
      const existing = lines.find(
        (line) => line.productId === action.productId
      );
      if (!existing)
        return [...lines, { productId: action.productId, quantity: 1 }];
      return lines.map((line) =>
        line.productId === action.productId
          ? { ...line, quantity: line.quantity + 1 }
          : line
      );
    }
    case "decrement":
      return lines
        .map((line) =>
          line.productId === action.productId
            ? { ...line, quantity: line.quantity - 1 }
            : line
        )
        .filter((line) => line.quantity > 0);
    case "remove":
      return lines.filter((line) => line.productId !== action.productId);
    case "clear":
      return [];
  }
}
