import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../loading/Loading";
import Cards from "../cards/Cards";
import Detailedview from "../detailed/Detailedview";

function Bestseller() {
  const [bsell, setBsell] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(null);
  const [viewData, setViewData] = useState({
    id: "",
    img: "",
    name: "",
    orgprice: "",
    color: "",
    brand: "",
    ratingcount: "",
    avgrating: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:9000/home/bestseller");
        setBsell(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleViewDetails = (
    id,
    img,
    name,
    orgprice,
    colour,
    brand,
    ratingcount,
    avgrating,
    description
  ) => {
    setView(id);
    setViewData({
      id,
      img,
      name,
      orgprice,
      color: colour,
      brand,
      ratingcount,
      avgrating,
      description,
    });
  };

  return (
    <div className="container mx-auto flex flex-col justify-around items-center">
      <div className="flex flex-col items-center justify-around gap-3">
        <h2 className="text-3xl">Best Sellers</h2>
        <div className="border-4 border-red-500 w-20"></div>
      </div>
      <div className="flex flex-wrap mx-24 gap-6 justify-around items-center my-8">
        {loading ? (
          <Loading />
        ) : view === null ? (
          bsell.length > 0 ? (
            bsell.map((newItem) => (
              <Cards
                key={newItem.field1}
                id={newItem.field1}
                img={newItem.img}
                name={newItem.name}
                orgprice={newItem.price}
                colour={newItem.colour}
                brand={newItem.brand}
                ratingcount={newItem.ratingcount}
                avgrating={newItem.avg_rating}
                description={newItem.description}
                onViewDetails={handleViewDetails}
              />
            ))
          ) : (
            <p>No best sellers found.</p>
          )
        ) : (
          <Detailedview
            key={view}
            id={viewData.id}
            img={viewData.img}
            name={viewData.name}
            orgprice={viewData.orgprice}
            colour={viewData.color}
            brand={viewData.brand}
            ratingcount={viewData.ratingcount}
            avgrating={viewData.avgrating}
            description={viewData.description}
          />
        )}
      </div>
    </div>
  );
}

export default Bestseller;