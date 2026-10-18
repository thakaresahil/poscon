import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useCart } from "../../context/CartContext";
import Loading from "../loading/Loading";

const inputClass =
  "block border border-grey-light w-full p-3 rounded mb-4 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5";

function Checkout() {
  const navigate = useNavigate();
  const { items, loading, count, total, placeOrder } = useCart();
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [formError, setFormError] = useState("");
  const [placing, setPlacing] = useState(false);

  // Prefill the form with what we already know about the user
  useEffect(() => {
    api
      .get("/profile")
      .then((response) => {
        const { name, pnum, address } = response.data;
        setShipping((current) => ({
          ...current,
          name: current.name || name || "",
          phone: current.phone || pnum || "",
          address: current.address || address || "",
        }));
      })
      .catch(() => {});
  }, []);

  function handlechange(event) {
    setShipping({
      ...shipping,
      [event.target.name]: event.target.value,
    });
  }

  const handlesubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    for (const key in shipping) {
      if (shipping[key].trim() === "") {
        setFormError("Please fill out all fields.");
        return;
      }
    }

    setPlacing(true);
    try {
      const order = await placeOrder(shipping);
      navigate(`/orders/${order.id}`, { replace: true, state: { placed: true } });
    } catch (error) {
      setFormError(error.response?.data?.error || "Could not place your order, please try again.");
      setPlacing(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="my-16">
        <Loading />
      </div>
    );
  }
  if (items.length === 0 && !placing) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="container mx-auto flex flex-col lg:flex-row gap-12 my-16 justify-center">
      <form className="w-full lg:w-1/2" onSubmit={handlesubmit}>
        <h1 className="mb-8 text-3xl">Shipping Address</h1>
        <input className={inputClass} name="name" placeholder="Full Name" value={shipping.name} onChange={handlechange} />
        <input className={inputClass} name="phone" placeholder="Phone Number" value={shipping.phone} onChange={handlechange} />
        <input className={inputClass} name="address" placeholder="Address (house no, street, area)" value={shipping.address} onChange={handlechange} />
        <div className="flex gap-4">
          <input className={inputClass} name="city" placeholder="City" value={shipping.city} onChange={handlechange} />
          <input className={inputClass} name="pincode" placeholder="Pincode" value={shipping.pincode} onChange={handlechange} />
        </div>
        {formError && <p className="text-red-700 text-sm mb-4">{formError}</p>}
        <button
          type="submit"
          disabled={placing}
          className="w-full text-center py-3 rounded bg-red-500 text-white hover:bg-red-600 focus:outline-none my-1 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {placing ? "Placing Order..." : `Place Order (₹${total})`}
        </button>
      </form>

      <div className="w-full lg:w-1/3 bg-gray-50 p-6 rounded h-fit">
        <h2 className="text-2xl mb-4">Order Summary</h2>
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 items-center mb-4">
            <img src={item.img} alt={item.namee} className="h-20" />
            <div className="flex-1">
              <p>{item.namee}</p>
              <p className="text-gray-500 text-sm">
                ₹{item.sellprice} x {item.quantity}
              </p>
            </div>
            <p className="font-semibold">₹{item.sellprice * item.quantity}</p>
          </div>
        ))}
        <hr className="my-4" />
        <div className="flex justify-between">
          <p>Items ({count})</p>
          <p>₹{total}</p>
        </div>
        <div className="flex justify-between">
          <p>Delivery</p>
          <p className="text-green-600">FREE</p>
        </div>
        <div className="flex justify-between font-semibold text-xl mt-2">
          <p>Total</p>
          <p>₹{total}</p>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
