import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/client";
import Loading from "../loading/Loading";
import AdminLayout from "./AdminLayout";

const PAGE_SIZE = 20;

function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const page = Number(searchParams.get("page")) || 1;
  const [searchInput, setSearchInput] = useState(q);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setResult(null);
    const params = { page, limit: PAGE_SIZE, sort: "newest" };
    if (q) params.q = q;
    api
      .get("/products", { params })
      .then((response) => setResult(response.data))
      .catch(() => setError("Could not load products, please try again."));
  }, [q, page, reload]);

  const handleSearch = (event) => {
    event.preventDefault();
    const term = searchInput.trim();
    setSearchParams(term ? { q: term } : {});
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.namee}"? Past orders will keep their copy of it.`)) {
      return;
    }
    setError("");
    try {
      await api.delete(`/admin/products/${product.id}`);
      setReload((count) => count + 1);
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete the product.");
    }
  };

  const goToPage = (number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", number);
    setSearchParams(next);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form className="flex gap-2" onSubmit={handleSearch}>
          <input
            type="search"
            name="adminSearch"
            placeholder="Search products"
            className="border rounded p-2 w-64"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button type="submit" className="px-4 py-2 border rounded">
            Search
          </button>
        </form>
        <Link
          to="/admin/products/new"
          className="px-6 py-2 bg-red-500 text-white rounded-md text-center transition-transform duration-300 hover:scale-105"
        >
          Add Product
        </Link>
      </div>

      {error && <p className="text-red-700">{error}</p>}
      {!result ? (
        <Loading />
      ) : result.products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Product</th>
                <th className="py-2">Category</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Sale Price</th>
                <th className="py-2 text-center">Bestseller</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100">
                  <td className="py-2">
                    <div className="flex items-center gap-3">
                      <img src={product.img} alt="" className="h-12 w-10 object-cover" />
                      <Link to={`/product/${product.id}`} className="hover:underline">
                        {product.namee}
                      </Link>
                    </div>
                  </td>
                  <td className="py-2 capitalize">
                    {product.gender} · {product.category}
                  </td>
                  <td className="py-2 text-right">₹{product.price}</td>
                  <td className="py-2 text-right">₹{product.sellprice}</td>
                  <td className="py-2 text-center">{product.is_bestseller ? "Yes" : "No"}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      Edit
                    </Link>
                    <button className="text-red-500 hover:underline" onClick={() => handleDelete(product)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result && result.totalPages > 1 && (
        <nav className="flex justify-center items-center gap-2" aria-label="Pagination">
          <button className="px-3 py-1 border rounded disabled:text-gray-300" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
            Previous
          </button>
          <span className="text-gray-500">
            Page {page} of {result.totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded disabled:text-gray-300"
            disabled={page >= result.totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </AdminLayout>
  );
}

export default AdminProducts;
