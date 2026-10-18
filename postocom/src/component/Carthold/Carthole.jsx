import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Carttemplate from "./Carttemplate";
import Loading from "../loading/Loading";
import { useCart } from "../../context/CartContext";

function Carthole() {
  const navigate = useNavigate();
  const { items, ready, count, total, updateQuantity, removeItem } = useCart();
  const [error, setError] = useState("");

  const runCartAction = async (action) => {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong, please try again.");
    }
  };

  const handleChechout = () => {
    navigate("/checkout");
  };

  if (!ready) {
    return (
      <div className="my-16">
        <Loading />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="page-title">Your cart is empty</h1>
        <p className="muted">Looks like you haven't added anything yet.</p>
        <NavLink to="/browseproduct" className="btn btn-primary">
          Continue Shopping
        </NavLink>
      </div>
    );
  }

  return (
    <div className="page my-10">
      <h1 className="page-title mb-6">
        Your Cart <span className="text-lg font-normal text-gray-500">({count} {count === 1 ? "item" : "items"})</span>
      </h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="flex flex-col divide-y divide-gray-200 border-y border-gray-200">
          {items.map((cartItem) => (
            <li key={cartItem.id}>
              <Carttemplate
                id={cartItem.id}
                product_id={cartItem.product_id}
                quantity={cartItem.quantity}
                namee={cartItem.namee}
                img={cartItem.img}
                price={cartItem.price}
                category={cartItem.category}
                size={cartItem.size}
                sellprice={cartItem.sellprice}
                onQuantityChange={(quantity) =>
                  runCartAction(() => updateQuantity(cartItem.id, quantity))
                }
                onRemove={() => runCartAction(() => removeItem(cartItem.id))}
              />
            </li>
          ))}
        </ul>

        <aside className="card h-fit p-5 lg:sticky lg:top-6">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
          <div className="flex justify-between text-gray-700">
            <span>Subtotal ({count} {count === 1 ? "item" : "items"})</span>
            <span>₹{total}</span>
          </div>
          <div className="mt-2 flex justify-between text-gray-700">
            <span>Delivery</span>
            <span className="text-green-700">FREE</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          {error && <p className="field-error" role="alert">{error}</p>}
          <button className="btn btn-primary mt-5 w-full" onClick={handleChechout}>
            Checkout
          </button>
          <NavLink to="/browseproduct" className="link mt-3 block text-center text-sm">
            Continue shopping
          </NavLink>
        </aside>
      </div>
    </div>
  );
}

export default Carthole;
