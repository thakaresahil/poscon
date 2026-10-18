import api from "../../api/client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Cards from "../cards/Cards";
import Loading from "../loading/Loading";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popularity" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount", label: "Biggest Discount" },
];

const genderOptions = [
  { value: "", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
];

const PAGE_SIZE = 12;

const filterButtonClass = (active) =>
  `text-left ${active ? "text-red-500 font-semibold" : "hover:text-red-500"}`;

function Productbrowse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const gender = searchParams.get("gender") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page")) || 1;

  const [result, setResult] = useState({ products: [], total: 0, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [priceInput, setPriceInput] = useState({ min: minPrice, max: maxPrice });

  useEffect(() => {
    api
      .get("/products/categories")
      .then((response) => setCategories(response.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setPriceInput({ min: minPrice, max: maxPrice });
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError("");
      const params = { sort, page, limit: PAGE_SIZE };
      if (q) params.q = q;
      if (gender) params.gender = gender;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      try {
        const response = await api.get("/products", { params });
        setResult(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Could not load products, please try again.");
        setResult({ products: [], total: 0, totalPages: 1 });
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [q, gender, category, minPrice, maxPrice, sort, page]);

  // Any filter change goes back to the first page
  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    if (!("page" in changes)) {
      next.delete("page");
    }
    setSearchParams(next);
  };

  const handlePriceSubmit = (event) => {
    event.preventDefault();
    updateParams({ minPrice: priceInput.min, maxPrice: priceInput.max });
  };

  const clearFilters = () => setSearchParams({});

  const hasFilters = q || gender || category || minPrice || maxPrice;
  const firstItem = result.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, result.total);

  return (
    <div className="container mx-auto flex flex-col md:flex-row gap-8 my-12 px-4">
      <aside className="flex flex-col gap-6 md:w-64 shrink-0">
        <div className="flex flex-col items-start gap-2">
          <h2 className="text-2xl">Shop</h2>
          <button
            className={filterButtonClass(!hasFilters && sort === "newest")}
            onClick={() => setSearchParams({ sort: "newest" })}
          >
            New Arrivals
          </button>
          <button
            className={filterButtonClass(!hasFilters && sort === "popular")}
            onClick={() => setSearchParams({ sort: "popular" })}
          >
            Best Sellers
          </button>
        </div>

        <div className="flex flex-col items-start gap-2">
          <h3 className="font-semibold">Gender</h3>
          {genderOptions.map((option) => (
            <button
              key={option.label}
              className={filterButtonClass(gender === option.value)}
              onClick={() => updateParams({ gender: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-start gap-2">
          <h3 className="font-semibold">Category</h3>
          <button
            className={filterButtonClass(category === "")}
            onClick={() => updateParams({ category: "" })}
          >
            All
          </button>
          {categories.map((option) => (
            <button
              key={option.category}
              className={`capitalize ${filterButtonClass(category === option.category)}`}
              onClick={() => updateParams({ category: option.category })}
            >
              {option.category} <span className="text-gray-400">({option.count})</span>
            </button>
          ))}
        </div>

        <form className="flex flex-col gap-2" onSubmit={handlePriceSubmit}>
          <h3 className="font-semibold">Price (₹)</h3>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              name="minPrice"
              placeholder="Min"
              className="border rounded p-2 w-full"
              value={priceInput.min}
              onChange={(event) => setPriceInput({ ...priceInput, min: event.target.value })}
            />
            <input
              type="number"
              min="0"
              name="maxPrice"
              placeholder="Max"
              className="border rounded p-2 w-full"
              value={priceInput.max}
              onChange={(event) => setPriceInput({ ...priceInput, max: event.target.value })}
            />
          </div>
          <button type="submit" className="py-2 rounded bg-red-500 text-white hover:bg-red-600">
            Apply
          </button>
        </form>

        {hasFilters && (
          <button className="text-blue-600 hover:underline text-left" onClick={clearFilters}>
            Clear all filters
          </button>
        )}
      </aside>

      <div className="flex flex-col gap-6 flex-1">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            {q && <h1 className="text-2xl">Results for "{q}"</h1>}
            <p className="text-gray-500">
              {loading
                ? "Loading products..."
                : `Showing ${firstItem}–${lastItem} of ${result.total} products`}
            </p>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-gray-500">Sort by</span>
            <select
              className="block border border-grey-light py-2 px-4 rounded"
              name="sort"
              value={sort}
              onChange={(event) => updateParams({ sort: event.target.value })}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <hr />

        {loading ? (
          <Loading />
        ) : error ? (
          <p className="text-red-700">{error}</p>
        ) : result.products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 my-12">
            <p className="text-xl">No products match your search.</p>
            <button
              className="px-6 py-2 bg-red-500 text-white rounded-md transition-transform duration-300 hover:scale-105"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap justify-around items-center gap-6">
            {result.products.map((productItem) => (
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
        )}

        {!loading && result.totalPages > 1 && (
          <nav className="flex justify-center items-center gap-2" aria-label="Pagination">
            <button
              className="px-3 py-1 border rounded disabled:text-gray-300"
              disabled={page <= 1}
              onClick={() => updateParams({ page: page - 1 })}
            >
              Previous
            </button>
            {Array.from({ length: result.totalPages }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                aria-current={number === page ? "page" : undefined}
                className={`px-3 py-1 border rounded ${
                  number === page ? "bg-red-500 text-white border-red-500" : ""
                }`}
                onClick={() => updateParams({ page: number })}
              >
                {number}
              </button>
            ))}
            <button
              className="px-3 py-1 border rounded disabled:text-gray-300"
              disabled={page >= result.totalPages}
              onClick={() => updateParams({ page: page + 1 })}
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

export default Productbrowse;
