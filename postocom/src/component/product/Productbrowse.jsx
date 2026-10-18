import api from "../../api/client";
import React, { useEffect, useState } from "react";
import Cards from "../cards/Cards";

function Productbrowse() {
  const [gender, setGender] = useState("women");
  const [filterCategory, setFilterCategory] = useState("");
  const [productData, setProductData] = useState([]);

  const fetchProductData = async (gender) => {
    try {
      const response = await api.get(`/browseproducts/${gender}`);
      setProductData(response.data);
    } catch (error) {
      console.error("Error Fetching Data: " + error);
    }
  };

  useEffect(() => {
    fetchProductData(gender);
  }, [gender]);

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  const handleDropdownChange = (event) => {
    setFilterCategory(event.target.value);
  };

  return (
    <div className="container mx-auto flex justify-around my-12">
      <div className="flex flex-col justify-start items-start w-96 my-20 gap-4">
        <h2 className="text-3xl">Product Category</h2>
        <button onClick={handleGenderChange} value="men">
          Men
        </button>
        <button onClick={handleGenderChange} value="women">
          Women
        </button>
        <button onClick={handleGenderChange} value="access">
          Accessories
        </button>
        <button onClick={handleGenderChange} value="newarrivals">
          New Arrivals
        </button>
      </div>

      <div className="flex flex-col justify-start m-6 gap-6">
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
        <hr />
        <div className="flex flex-wrap justify-around items-center gap-6">
          {productData.map((productItem) => (
            <Cards
              key={productItem.id}
              id={productItem.id}
              img={productItem.img}
              name={productItem.namee}
              orgprice={productItem.price}
              sellprice={productItem.sellprice}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Productbrowse;
