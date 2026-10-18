import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Carttemplate from "./Carttemplate";
import Loading from "../loading/Loading";
import { useCart } from "../../context/CartContext";

function Carthole() {
  const { items, loading, count, total, updateQuantity, removeItem, checkout } = useCart();
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const runCartAction = async (action) => {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong, please try again.");
    }
  };

  const handleChechout = () =>
    runCartAction(async () => {
      await checkout();
      setOrderPlaced(true);
    });

  if (loading && items.length === 0) {
    return (
      <div className="my-16">
        <Loading />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto h-[60vh] flex flex-col justify-center items-center gap-4">
        <h1 className="text-3xl">
          {orderPlaced ? "Thank you, your order has been placed!" : "Your cart is empty"}
        </h1>
        <p className="text-gray-500">
          {orderPlaced
            ? "We'll get it to you soon."
            : "Looks like you haven't added anything yet."}
        </p>
        <NavLink
          to="/browseproduct"
          className="px-6 py-2 bg-red-500 text-white rounded-md transition-transform duration-300 hover:scale-105"
        >
          Continue Shopping
        </NavLink>
      </div>
    );
  }

  return (
    <div className=" container mx-auto flex flex-col gap-6 my-16 justify-around w-1/2">
      {items.map((cartItem) => (
        <Carttemplate
          key={cartItem.id}
          id={cartItem.id}
          product_id={cartItem.product_id}
          quantity={cartItem.quantity}
          namee={cartItem.namee}
          description={cartItem.description}
          img={cartItem.img}
          price={cartItem.price}
          gender={cartItem.gender}
          category={cartItem.category}
          sellprice={cartItem.sellprice}
          onQuantityChange={(quantity) =>
            runCartAction(() => updateQuantity(cartItem.id, quantity))
          }
          onRemove={() => runCartAction(() => removeItem(cartItem.id))}
        />
      ))}
      {error && <p className="text-red-700 text-sm">{error}</p>}
      <div className="flex justify-between">
        <p className="font-semibold text-3xl">
          Sub Total ({count} {count === 1 ? "item" : "items"}): ₹{total}
        </p>
        <button
          className="px-6 py-2 bg-red-500 text-white rounded-md transition-transform duration-300 hover:scale-105"
          onClick={handleChechout}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

export default Carthole;
