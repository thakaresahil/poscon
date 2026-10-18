import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import Loading from "../loading/Loading";
import NotFound from "../notfound/NotFound";
import { formatOrderNumber, needsPayment } from "../../utils/format";
import {
  TEST_CARDS,
  TEST_UPI,
  formatCardNumber,
  formatExpiry,
  getCardBrand,
  isValidCardNumber,
} from "../../utils/payment";

const inputClass =
  "block border border-grey-light w-full p-3 rounded mb-4 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5";

const methods = [
  { id: "card", label: "Credit / Debit Card" },
  { id: "upi", label: "UPI" },
  { id: "cod", label: "Cash on Delivery" },
];

function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [upiId, setUpiId] = useState("");
  const [formError, setFormError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
        if (response.data.payment_status === "failed" && response.data.last_payment?.failure_reason) {
          setFormError(`Last attempt failed: ${response.data.last_payment.failure_reason}`);
        }
      } catch (error) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCardChange = (event) => {
    const { name, value } = event.target;
    const formatted =
      name === "number"
        ? formatCardNumber(value)
        : name === "expiry"
        ? formatExpiry(value)
        : name === "cvv"
        ? value.replace(/\D/g, "").slice(0, 4)
        : value;
    setCard({ ...card, [name]: formatted });
  };

  const validate = () => {
    if (method === "card") {
      if (!card.number || !card.name || !card.expiry || !card.cvv) {
        return "Please fill out all card details.";
      }
      if (!isValidCardNumber(card.number)) {
        return "Please enter a valid card number.";
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) {
        return "Expiry must be in MM/YY format.";
      }
    }
    if (method === "upi" && !upiId.includes("@")) {
      return "Please enter a valid UPI ID, like name@bank.";
    }
    return "";
  };

  const handlesubmit = async (event) => {
    event.preventDefault();
    const error = validate();
    setFormError(error);
    if (error) return;

    const body =
      method === "card" ? { method, card } : method === "upi" ? { method, upiId } : { method };

    setProcessing(true);
    try {
      await api.post(`/orders/${id}/pay`, body);
      navigate(`/orders/${id}`, { replace: true, state: { placed: true } });
    } catch (err) {
      setFormError(err.response?.data?.error || "Payment could not be completed, please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="my-16">
        <Loading />
      </div>
    );
  }
  if (!order) {
    return <NotFound />;
  }
  if (!needsPayment(order.payment_status)) {
    return <Navigate to={`/orders/${id}`} replace />;
  }

  const brand = getCardBrand(card.number);

  return (
    <div className="container mx-auto my-16 w-full lg:w-1/2 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Payment</h1>
        <p className="text-gray-500">
          Order {formatOrderNumber(order.id)} · Amount to pay{" "}
          <span className="font-semibold text-black">₹{order.total}</span>
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded text-sm">
        <p className="font-semibold">Demo mode: no real payment is taken.</p>
        {method === "card" && (
          <ul className="mt-2">
            {TEST_CARDS.map((test) => (
              <li key={test.number}>
                <code>{test.number}</code> → {test.result}
              </li>
            ))}
            <li className="mt-1">Use any future expiry date, any name and any 3 digit CVV.</li>
          </ul>
        )}
        {method === "upi" && (
          <ul className="mt-2">
            {TEST_UPI.map((test) => (
              <li key={test.id}>
                <code>{test.id}</code> → {test.result}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2" role="tablist">
        {methods.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={method === option.id}
            onClick={() => {
              setMethod(option.id);
              setFormError("");
            }}
            className={`flex-1 py-2 rounded border ${
              method === option.id ? "border-red-500 text-red-500 font-semibold" : "border-gray-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <form onSubmit={handlesubmit}>
        {method === "card" && (
          <>
            <div className="relative">
              <input
                className={inputClass}
                name="number"
                placeholder="Card Number"
                inputMode="numeric"
                autoComplete="cc-number"
                value={card.number}
                onChange={handleCardChange}
              />
              {brand && (
                <span className="absolute right-3 top-3 text-gray-500 text-sm">{brand}</span>
              )}
            </div>
            <input
              className={inputClass}
              name="name"
              placeholder="Name on Card"
              autoComplete="cc-name"
              value={card.name}
              onChange={handleCardChange}
            />
            <div className="flex gap-4">
              <input
                className={inputClass}
                name="expiry"
                placeholder="MM/YY"
                inputMode="numeric"
                autoComplete="cc-exp"
                value={card.expiry}
                onChange={handleCardChange}
              />
              <input
                className={inputClass}
                name="cvv"
                type="password"
                placeholder="CVV"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={card.cvv}
                onChange={handleCardChange}
              />
            </div>
          </>
        )}
        {method === "upi" && (
          <input
            className={inputClass}
            name="upiId"
            placeholder="UPI ID (e.g. name@okaxis)"
            value={upiId}
            onChange={(event) => setUpiId(event.target.value)}
          />
        )}
        {method === "cod" && (
          <p className="mb-4 text-gray-600">
            Pay ₹{order.total} in cash when your order is delivered.
          </p>
        )}

        {formError && <p className="text-red-700 text-sm mb-4">{formError}</p>}
        <button
          type="submit"
          disabled={processing}
          className="w-full text-center py-3 rounded bg-red-500 text-white hover:bg-red-600 focus:outline-none my-1 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {processing
            ? "Processing..."
            : method === "cod"
            ? "Confirm Order"
            : `Pay ₹${order.total}`}
        </button>
      </form>
    </div>
  );
}

export default Payment;
