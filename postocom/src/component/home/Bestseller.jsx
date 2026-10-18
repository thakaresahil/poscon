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
    <section className="page my-16">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <p className="eyebrow">Customer Favourites</p>
        <h2 className="section-title">Best Sellers</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-full"><Loading /></div>
        ) : (
          bsell.length > 0 ? (
            bsell.slice(0, 8).map((newItem) => (
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
            <p className="col-span-full muted">No best sellers found.</p>
          )
        )}
      </div>
    </section>
  );
}

export default Bestseller;