import React from "react";
import { Link } from "react-router-dom";
import { MAX_QUANTITY } from "../../context/CartContext";

function Carttemplate({
  id,
  product_id,
  quantity,
  namee,
  description,
  img,
  price,
  gender,
  category,
  sellprice,
  onQuantityChange,
  onRemove,
}) {
  const discPercents = Math.floor(((price - sellprice) / price) * 100);
  return (
    <div className="flex gap-6 justify-start items-start m-2">
      <Link to={`/product/${product_id}`}>
        <img src={img} alt={namee} className="h-72 " />
      </Link>
      <div className="flex flex-col items-start gap-1">
        <Link to={`/product/${product_id}`} className="font-semibold text-xl ">
          {namee}
        </Link>
        <p><span className="font-semibold">Category: </span> {category}</p>
        <div className="flex justify-start items-center gap-2">
          <p>
            At{" "}
            <span className="font-light text-gray-400 line-through ">
              ₹{price}
            </span>{" "}
            <span className="font-semibold ">₹{sellprice}</span>
            <span className="text-red-400 ">({discPercents}%OFF)</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Quantity: </span>
          <div className="flex justify-center items-center border">
            <button
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="m-0 p-1 px-3 disabled:text-gray-300"
              aria-label={`Decrease quantity of ${namee}`}
            >
              -
            </button>
            <span className="p-1 px-3">{quantity}</span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={quantity >= MAX_QUANTITY}
              className="m-0 p-1 px-3 disabled:text-gray-300"
              aria-label={`Increase quantity of ${namee}`}
            >
              +
            </button>
          </div>
        </div>
        <p><span className="font-semibold">Item Total: </span>₹{sellprice * quantity}</p>
        <p><span className="font-semibold">Gender: </span>{gender}</p>
        <p>{description}</p>
        <button onClick={onRemove} className="text-red-500 hover:underline mt-2">
          Remove
        </button>
      </div>
    </div>
  );
}

export default Carttemplate;
