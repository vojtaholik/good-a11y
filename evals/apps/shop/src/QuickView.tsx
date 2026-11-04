import { useEffect, useRef } from "react";

import { formatPrice, type Product } from "./data";

export function QuickView({
  product,
  onClose,
  onAdd,
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (product && !dialog.open) dialog.showModal();
    if (!product && dialog.open) dialog.close();
  }, [product]);

  return (
    <dialog
      ref={ref}
      className="quick-view"
      aria-labelledby="quick-view-title"
      onClose={onClose}
    >
      {product && (
        <>
          <h2 id="quick-view-title">{product.name}</h2>
          <p>{product.description}</p>
          <p className="price">{formatPrice(product.price)}</p>
          <div className="actions">
            <button type="button" onClick={() => onAdd(product)}>
              Add to cart
            </button>
            <button type="button" className="secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
