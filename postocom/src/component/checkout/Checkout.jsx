import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useCart } from "../../context/CartContext";
import Loading from "../loading/Loading";

const inputClass = "input mb-4";

function Checkout() {
  const navigate = useNavigate();
  const { items, ready, count, total, placeOrder } = useCart();
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [formError, setFormError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [saveAddress, setSaveAddress] = useState(false);

  // Prefill the form with what we already know about the user
  useEffect(() => {
    api
      .get("/profile")
      .then((response) => {
        const { name, pnum, address, city, pincode } = response.data;
        setProfile(response.data);
        // Offer to save the address when the account does not have one yet
        setSaveAddress(!address);
        setShipping((current) => ({
          ...current,
          name: current.name || name || "",
          phone: current.phone || pnum || "",
          address: current.address || address || "",
          city: current.city || city || "",
          pincode: current.pincode || pincode || "",
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
      if (saveAddress && profile) {
        await api
          .patch("/profile", {
            name: profile.name || shipping.name,
            pnum: profile.pnum,
            address: shipping.address,
            city: shipping.city,
            pincode: shipping.pincode,
          })
          .catch(() => {});
      }
      navigate(`/orders/${order.id}/pay`, { replace: true });
    } catch (error) {
      setFormError(error.response?.data?.error || "Could not place your order, please try again.");
      setPlacing(false);
    }
  };

  if (!ready) {
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
    <div className="page my-10 grid gap-8 lg:grid-cols-[1fr_360px]">
      <form className="card flex flex-col gap-4 p-6" onSubmit={handlesubmit} noValidate>
        <div>
          <p className="eyebrow">Step 1 of 2</p>
          <h1 className="page-title mt-1">Delivery Address</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ship-name" className="label">Full name</label>
            <input id="ship-name" className={inputClass} name="name" placeholder="Full Name" autoComplete="name" value={shipping.name} onChange={handlechange} />
          </div>
          <div>
            <label htmlFor="ship-phone" className="label">Phone number</label>
            <input id="ship-phone" className={inputClass} name="phone" type="tel" inputMode="numeric" placeholder="Phone Number" autoComplete="tel" value={shipping.phone} onChange={handlechange} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ship-address" className="label">Address</label>
            <input id="ship-address" className={inputClass} name="address" placeholder="Address (house no, street, area)" autoComplete="street-address" value={shipping.address} onChange={handlechange} />
          </div>
          <div>
            <label htmlFor="ship-city" className="label">City</label>
            <input id="ship-city" className={inputClass} name="city" placeholder="City" autoComplete="address-level2" value={shipping.city} onChange={handlechange} />
          </div>
          <div>
            <label htmlFor="ship-pincode" className="label">Pincode</label>
            <input id="ship-pincode" className={inputClass} name="pincode" inputMode="numeric" placeholder="Pincode" autoComplete="postal-code" value={shipping.pincode} onChange={handlechange} />
          </div>
        </div>
        {profile && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} />
            Save this address to my account
          </label>
        )}
        {formError && <p className="field-error" role="alert">{formError}</p>}
        <button type="submit" disabled={placing} className="btn btn-primary w-full">
          {placing ? "Placing Order..." : `Continue to Payment (₹${total})`}
        </button>
      </form>

      <aside className="card h-fit p-5 lg:sticky lg:top-6">
        <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 items-center mb-4">
            <img src={item.img} alt={item.namee} className="h-20 w-16 rounded-md bg-gray-50 object-cover" />
            <div className="flex-1">
              <p>{item.namee}</p>
              <p className="text-gray-500 text-sm">
                {item.size ? `Size ${item.size} · ` : ""}₹{item.sellprice} x {item.quantity}
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
      </aside>
    </div>
  );
}

export default Checkout;
