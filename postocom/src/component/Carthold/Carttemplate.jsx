import React from "react";
import { Link } from "react-router-dom";
import { MAX_QUANTITY } from "../../context/CartContext";

function Carttemplate({
  product_id,
  quantity,
  namee,
  img,
  price,
  category,
  size,
  sellprice,
  onQuantityChange,
  onRemove,
}) {
  const discPercents = Math.floor(((price - sellprice) / price) * 100);
  return (
    <div className="flex gap-4 py-5">
      <Link to={`/product/${product_id}`} className="w-24 shrink-0 sm:w-28">
        <img src={img} alt={namee} className="aspect-[4/5] w-full rounded-md bg-gray-50 object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/product/${product_id}`} className="font-semibold hover:text-red-600">
            {namee}
          </Link>
          <p className="shrink-0 font-semibold">₹{sellprice * quantity}</p>
        </div>
        <p className="text-sm capitalize text-gray-600">
          {category}
          {size ? <> · Size <span className="font-medium uppercase text-gray-900">{size}</span></> : null}
        </p>
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="price">₹{sellprice}</span>
          <span className="price-old">₹{price}</span>
          {discPercents > 0 && <span className="discount">({discPercents}% OFF)</span>}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center rounded-md border border-gray-300">
            <button
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="h-9 w-9 disabled:text-gray-300"
              aria-label={`Decrease quantity of ${namee}`}
            >
              -
            </button>
            <span className="w-8 text-center" aria-label="Quantity">{quantity}</span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={quantity >= MAX_QUANTITY}
              className="h-9 w-9 disabled:text-gray-300"
              aria-label={`Increase quantity of ${namee}`}
            >
              +
            </button>
          </div>
          <button onClick={onRemove} className="text-sm font-medium text-gray-600 hover:text-red-600">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default Carttemplate;
