import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../loading/Loading";
import Cards from "../cards/Cards";

function Bestseller() {
  const [bsell, setBsell] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9000/home/bestseller"
        );
        setBsell(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(true);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto flex flex-col justify-around items-center">
      <div className="flex flex-col items-center justify-around gap-3">
        <h2 className="text-3xl">Best Sellers</h2>
        <div className="border-4 border-red-500 w-20 "></div>
      </div>
      <div className="flex flex-wrap mx-24 gap-6 justify-around items-center my-8">
        {loading ? (
          bsell.length > 0 ? (
            bsell.map((newItem) => (
              <Cards
                key={newItem.field1}
                pimg={newItem.img}
                name={newItem.name}
                orgprice={newItem.price}
              />
            ))
          ) : null
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
}

export default Bestseller;
