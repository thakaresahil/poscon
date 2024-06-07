import axios from "axios";
import React, { useEffect, useState } from "react";
import Cards from "../cards/Cards";
import Detailedview from "../detailed/Detailedview";

function Productbrowse() {
  const [gender, setGender] = useState("women");
  const [filterCategory, setFilterCategory] = useState("");
  const [productData, setProductData] = useState([]);
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

  const fetchProductData = async (gender) => {
    try {
      const response = await axios.get(
        `http://localhost:9000/browseproducts/${gender}`
      );
      setProductData(response.data);
    } catch (error) {
      console.error("Error Fetching Data: " + error);
    }
  };

  useEffect(() => {
    fetchProductData(gender);
  }, [gender]);

  const handleViewDetails = (id, img, name, orgprice, colour, brand, ratingcount, avgrating, description) => {
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

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  const handleDropdownChange = (event) => {
    setFilterCategory(event.target.value);
  };

  return (
    <div className="container mx-auto flex justify-around my-12">
      {view === null ? (
        <div className="flex flex-col justify-start items-start w-96 my-20 gap-4">
          <h2 className="text-3xl">Product Category</h2>
          <button onClick={handleGenderChange} value="men">Men</button>
          <button onClick={handleGenderChange} value="women">Women</button>
          <button>Accessories</button>
          <button>New Arrivals</button>
        </div>
      ) : null}

      <div className="flex flex-col justify-start m-6 gap-6">
        {view === null ? (
          <select
            className="block border border-grey-light w-96 py-2 px-4 rounded"
            name="filterCategory"
            value={filterCategory}
            onChange={handleDropdownChange}
            required
          >
            <option value="">All</option>
            <option value={`POP${gender}`}>Popularity</option>
            <option value={`LPR${gender}`}>Low Price</option>
            <option value={`HPR${gender}`}>High Price</option>
          </select>
        ) : null}
        <hr />
        <div>
          <div className="flex flex-wrap justify-around items-center gap-6">
            {productData.length > 0 && view === null && (
              productData.map((productItem) => (
                <Cards
                  key={productItem.field1}
                  id={productItem.field1}
                  img={productItem.img}
                  name={productItem.name}
                  orgprice={productItem.price}
                  colour={productItem.colour}
                  brand={productItem.brand}
                  ratingcount={productItem.ratingcount}
                  avgrating={productItem.avg_rating}
                  description={productItem.description}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>

          <div>
            {view !== null && (
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
      </div>
    </div>
  );
}

export default Productbrowse;