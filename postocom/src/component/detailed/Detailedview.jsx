import { useState } from "react";
import { FaTruck } from "react-icons/fa";

function Detailedview({
  id,
  img,
  name,
  orgprice,
  colour,
  brand,
  ratingcoutn,
  avgrating,
  description,
}) {
  const [count, setCount] = useState(1);

  const increment = () => {
    setCount(function (prevCount) {
      return (prevCount += 1);
    });
  };
  function decrement() {
    setCount(function (prevCount) {
      if (prevCount > 0) {
        return (prevCount -= 1);
      } else {
        return (prevCount = 0);
      }
    });
  }
  const discountedPrice = (orgprice * 0.67).toFixed(2);
  return (
    <div className="container mx-auto flex flex-col lg:flex-row gap-5"> 
      <div>
        <img src={img} alt="" />
      </div>
      <div className="w-full flex flex-col gap-2 justify-around">
        <h1 className="text-3xl ">{name}</h1>
        <p className="text-2xl">{brand}</p>
        <div className="flex gap-2">
          <p>Rating: {ratingcoutn}</p>
          <p>{avgrating}</p>
        </div>
        <p>{description}</p>
        <p>{colour}</p>
        <div className="flex w-full justify-center items-center bg-gray-100 p-2 rounded-lg">
          <FaTruck />
          <p>FREE DELIVERY</p>
        </div>
        <p className="text-gray-300 line-through">{orgprice}</p>
        <p>At {discountedPrice}</p>

        <div className="flex justify-between items-center">
          <p>Quantity</p>
          <div className="flex justify-center items-center border">
          <button onClick={decrement} className="m-0  p-2 px-4 ">-</button>
          <h1 className="p-2 px-4 m-0">{count}</h1>
          <button onClick={increment} className="m-0  p-2 px-4">+</button>
          </div>
          <button className="bg-red-500 p-2 px-4 rounded-md text-white">ADD TO CART</button>
        </div>
      </div>
    </div>
  );
}

export default Detailedview;
