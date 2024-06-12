import axios from "axios";
import React, { useEffect, useState } from "react";
import Carttemplate from "./Carttemplate";
import Loading from "../loading/Loading";
import { useNavigate } from "react-router-dom";

function Carthole() {
  const navigate = useNavigate();
  const uidcheck = localStorage.getItem("uid");
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [cartitemdata, setCartItemData] = useState([]);
  const pid = [];
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios
          .post("http://localhost:9000/cartdata", details, {
            headers: { "Content-Type": "application/json" },
          })
          .then((response) => {
            setCartItemData(response.data);
            // console.log(response.data);
          });
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(true);
      }
    };
    const details = {
      uid: uidcheck,
      token: token,
    };
    fetchData(details);
  }, [uidcheck, token]);

  useEffect(() => {
    // Calculate total price whenever productData changes
    const total = cartitemdata.reduce((sum, product) => {
      return sum + parseInt(product.sellprice, 10); // Ensure sellprice is parsed as integer
    }, 0);
    setTotal(total);
  }, [cartitemdata]);

  const handleChechout = async () => {
    if (cartitemdata.length < 1) {
      navigate("/");
    } else {
      cartitemdata.forEach((item) => {
        pid.push(item.product_id);
      });
      const buydetails = {
        pid: pid,
        uid: uidcheck,
        token: token,
      };
      try {
        await axios
          .patch("http://localhost:9000/buyitem", buydetails, {
            headers: { "Content-Type": "application/json" },
          })
          .then((response) => {
            try {
              const result = response.data;
              console.log(result);
            } catch (error) {
              console.log("Error Parsing JSON:", error);
            }
          });
      } catch (error) {
        console.error("Error Checkouting the products", error);
      }
    }
  };

  return (
    <div className=" container mx-auto flex flex-col gap-6 my-16 justify-around w-1/2">
      {loading ? (
        cartitemdata.length > 0 ? (
          cartitemdata.map((cartItem) => (
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
            />
          ))
        ) : (
          <p>No Product Added To the cart</p>
        )
      ) : (
        <Loading />
      )}
      <div className="flex justify-between">
        <p className="font-semibold text-3xl">Sub Total: {total}</p>
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
