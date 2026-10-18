import { useState } from "react";
import { FaTruck } from "react-icons/fa";
import { BsCash } from "react-icons/bs";
import { GiAnticlockwiseRotation } from "react-icons/gi";
import { MAX_QUANTITY } from "../../context/CartContext";

const perks = [
  [FaTruck, "Free delivery on every order"],
  [BsCash, "Cash on delivery available"],
  [GiAnticlockwiseRotation, "Easy 7-day returns"],
];

function Detailedview({ product, discPercents, onAddToCart, adding, error }) {
  const { id, img, namee: name, price: orgprice, sellprice, description, category, gender, sizes = [] } = product;
  const [count, setCount] = useState(1);
  const [size, setSize] = useState("");
  const [sizeError, setSizeError] = useState("");

  const increment = () => setCount((prevCount) => Math.min(prevCount + 1, MAX_QUANTITY));
  const decrement = () => setCount((prevCount) => Math.max(prevCount - 1, 1));

  const handleAddToCartClick = () => {
    if (sizes.length > 0 && !size) {
      setSizeError("Please choose a size.");
      return;
    }
    setSizeError("");
    onAddToCart(id, count, size);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
      <div className="overflow-hidden rounded-lg bg-gray-50">
        <img src={img} alt={name} className="aspect-[4/5] w-full object-cover" />
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm capitalize text-gray-500">
            {gender} · {category}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{name}</h1>
        </div>

        <p className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-2xl font-semibold">₹{sellprice}</span>
          <span className="text-gray-500 line-through">₹{orgprice}</span>
          {discPercents > 0 && <span className="discount text-base">{discPercents}% OFF</span>}
        </p>
        <p className="-mt-3 text-sm text-gray-500">Inclusive of all taxes</p>

        {sizes.length > 0 && (
          <fieldset>
            <legend className="label">Size{size ? `: ${size}` : ""}</legend>
            <div className="flex flex-wrap gap-2">
              {sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={size === option}
                  onClick={() => {
                    setSize(option);
                    setSizeError("");
                  }}
                  className={`h-11 min-w-[3rem] rounded-md border px-3 font-medium ${
                    size === option ? "border-red-500 bg-red-50 text-red-600" : "border-gray-300 hover:border-gray-900"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {sizeError && <p className="field-error" role="alert">{sizeError}</p>}
          </fieldset>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-md border border-gray-300" aria-label="Quantity">
            <button onClick={decrement} disabled={count <= 1} className="h-11 w-11 disabled:text-gray-300" aria-label="Decrease quantity">
              -
            </button>
            <span className="w-8 text-center">{count}</span>
            <button onClick={increment} disabled={count >= MAX_QUANTITY} className="h-11 w-11 disabled:text-gray-300" aria-label="Increase quantity">
              +
            </button>
          </div>
          <button onClick={handleAddToCartClick} disabled={adding} className="btn btn-primary h-11 flex-1">
            {adding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
        {error && <p className="field-error" role="alert">{error}</p>}

        <ul className="flex flex-col gap-2 rounded-lg bg-gray-50 p-4 text-sm">
          {perks.map(([Icon, text]) => (
            <li key={text} className="flex items-center gap-3">
              <Icon className="text-red-500" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>

        <div>
          <h2 className="font-semibold">Description</h2>
          <p className="muted mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default Detailedview;
