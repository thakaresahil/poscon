import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import Loading from "../loading/Loading";
import NotFound from "../notfound/NotFound";
import AdminLayout from "./AdminLayout";

const inputClass = "input";

const emptyProduct = {
  namee: "",
  description: "",
  img: "",
  price: "",
  sellprice: "",
  gender: "women",
  category: "",
  is_bestseller: false,
  sizes: "",
};

function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [product, setProduct] = useState(emptyProduct);
  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/products/${id}`)
      .then((response) => {
        const { namee, description, img, price, sellprice, gender, category, is_bestseller, sizes } = response.data;
        setProduct({ namee, description, img, price, sellprice, gender, category, is_bestseller, sizes: (sizes || []).join(", ") });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handlechange = (event) => {
    const { name, value, type, checked } = event.target;
    setProduct({ ...product, [name]: type === "checkbox" ? checked : value });
  };

  const handlesubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSaving(true);
    const body = {
      ...product,
      price: Number(product.price),
      sellprice: Number(product.sellprice),
      sizes: product.sizes.split(",").map((size) => size.trim()).filter(Boolean),
    };
    try {
      if (isEdit) {
        await api.put(`/admin/products/${id}`, body);
      } else {
        await api.post("/admin/products", body);
      }
      navigate("/admin/products");
    } catch (error) {
      setFormError(error.response?.data?.error || "Could not save the product, please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }
  if (notFound) {
    return <NotFound />;
  }

  const discount =
    Number(product.price) > 0 && Number(product.sellprice) > 0
      ? Math.floor(((product.price - product.sellprice) / product.price) * 100)
      : null;

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row gap-8">
        <form className="flex flex-col gap-4 w-full lg:w-2/3" onSubmit={handlesubmit}>
          <h2 className="text-2xl">{isEdit ? "Edit Product" : "Add Product"}</h2>
          <label className="flex flex-col gap-1">
            Name
            <input className={inputClass} name="namee" value={product.namee} onChange={handlechange} />
          </label>
          <label className="flex flex-col gap-1">
            Description
            <textarea className={inputClass} name="description" rows="3" value={product.description} onChange={handlechange} />
          </label>
          <label className="flex flex-col gap-1">
            Image URL
            <input className={inputClass} name="img" placeholder="https://..." value={product.img} onChange={handlechange} />
          </label>
          <div className="flex gap-4">
            <label className="flex flex-col gap-1 w-full">
              Price (₹)
              <input className={inputClass} type="number" min="1" name="price" value={product.price} onChange={handlechange} />
            </label>
            <label className="flex flex-col gap-1 w-full">
              Sale Price (₹)
              <input className={inputClass} type="number" min="1" name="sellprice" value={product.sellprice} onChange={handlechange} />
            </label>
          </div>
          <div className="flex gap-4">
            <label className="flex flex-col gap-1 w-full">
              Gender
              <select className={inputClass} name="gender" value={product.gender} onChange={handlechange}>
                <option value="women">Women</option>
                <option value="men">Men</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 w-full">
              Category
              <input className={inputClass} name="category" placeholder="e.g. shirts" value={product.category} onChange={handlechange} />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            Sizes
            <input className={inputClass} name="sizes" placeholder="e.g. S, M, L, XL (leave empty for one size)" value={product.sizes} onChange={handlechange} />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_bestseller" checked={product.is_bestseller} onChange={handlechange} />
            Show in Best Sellers
          </label>
          {formError && <p className="text-red-700 text-sm">{formError}</p>}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/products")}>
              Cancel
            </button>
          </div>
        </form>

        <div className="w-full lg:w-1/3 flex flex-col items-center gap-2 bg-gray-50 p-6 rounded h-fit">
          <p className="text-gray-500 text-sm">Preview</p>
          {product.img ? (
            <img src={product.img} alt="" className="w-52" />
          ) : (
            <div className="w-52 h-64 bg-gray-200 flex items-center justify-center text-gray-400">No image</div>
          )}
          <p className="text-center">{product.namee || "Product name"}</p>
          <p>
            <span className="font-semibold">At ₹{product.sellprice || 0}</span>{" "}
            <span className="text-gray-300 line-through text-sm">₹{product.price || 0}</span>
            {discount !== null && <span className="text-red-400"> ({discount}% OFF)</span>}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ProductForm;
