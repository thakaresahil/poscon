import React, { useEffect, useState } from "react";
import api from "../../api/client";
import Loading from "../loading/Loading";
import Cards from "../cards/Cards";

function Bestseller() {
  const [bsell, setBsell] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/home/bestseller");
        setBsell(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto flex flex-col justify-around items-center">
      <div className="flex flex-col items-center justify-around gap-3">
        <h2 className="text-3xl">Best Sellers</h2>
        <div className="border-4 border-red-500 w-20"></div>
      </div>
      <div className="flex flex-wrap mx-24 gap-6 justify-around items-center my-8">
        {loading ? (
          <Loading />
        ) : (
          bsell.length > 0 ? (
            bsell.map((newItem) => (
              <Cards
                key={newItem.id}
                id={newItem.id}
                img={newItem.img}
                name={newItem.name}
                orgprice={newItem.price}
                sellprice={newItem.sellprice}
              />
            ))
          ) : (
            <p>No best sellers found.</p>
          )
        )}
      </div>
    </div>
  );
}

export default Bestseller;