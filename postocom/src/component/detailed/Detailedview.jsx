import { useState } from "react";
import { FaTruck } from "react-icons/fa";

function Detailedview({
  id,
  img,
  name,
  orgprice = 0,
  colour,
  brand,
  ratingcount,
  avgrating,
  description,
  onAddToCart,
}) {
  const [count, setCount] = useState(1);

  const increment = () => {
    setCount((prevCount) => prevCount + 1);
  };

  const decrement = () => {
    setCount((prevCount) => (prevCount > 1 ? prevCount - 1 : 1));
  };

  const discountedPrice = (orgprice * 0.67).toFixed(2);

  const handleAddToCartClick = () => {
    const item = { id, img, name, orgprice, colour, brand, ratingcount, avgrating, description };
    onAddToCart(item, count);
  };

  return (
    <div className="container mx-auto flex flex-col lg:flex-row gap-5">
      <div>
        <img src={img} alt={name} />
      </div>
      <div className="w-3/4 flex flex-col gap-2">
        <h1 className="text-3xl">{name}</h1>
        <p className="text-2xl">{brand}</p>
        <div className="flex gap-2">
          <p>Rating: {ratingcount}</p>
          <p>{avgrating}</p>
        </div>
        <p>{description}</p>
        <p>{colour}</p>
        <div className="flex w-full justify-center items-center bg-gray-100 p-2 rounded-lg">
          <FaTruck />
          <p>FREE DELIVERY</p>
        </div>
        <p className="text-gray-300 line-through">${orgprice.toFixed(2)}</p>
        <p>At ${discountedPrice}</p>

        <div className="flex justify-between items-center">
          <p>Quantity</p>
          <div className="flex justify-center items-center border">
            <button onClick={decrement} className="m-0 p-2 px-4">
              -
            </button>
            <h1 className="p-2 px-4 m-0">{count}</h1>
            <button onClick={increment} className="m-0 p-2 px-4">
              +
            </button>
          </div>
          <button onClick={handleAddToCartClick} className="bg-red-500 p-2 px-4 rounded-md text-white">
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}

export default Detailedview;