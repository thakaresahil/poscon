import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import Detailedview from "../detailed/Detailedview";
import Cards from "../cards/Cards";
import Loading from "../loading/Loading";
import NotFound from "../notfound/NotFound";

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

function ProductPage() {
  const { id } = useParams();
  const { isLoggedIn, openLogin } = useAuth();
  const { addItem } = useCart();
  const showToast = useToast();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setCartError("");
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // More from the same category, falling back to the same gender
  useEffect(() => {
    if (!product) return;
    const load = async () => {
      const sameCategory = await api.get("/products", {
        params: { category: product.category, gender: product.gender, sort: "popular", limit: 5 },
      });
      let items = sameCategory.data.products.filter((item) => item.id !== product.id);
      if (items.length < 4) {
        const sameGender = await api.get("/products", { params: { gender: product.gender, sort: "popular", limit: 8 } });
        const extra = sameGender.data.products.filter(
          (item) => item.id !== product.id && !items.some((existing) => existing.id === item.id)
        );
        items = [...items, ...extra];
      }
      setRelated(items.slice(0, 4));
    };
    load().catch(() => setRelated([]));
  }, [product]);

  const handleAddToCart = async (pid, count, size) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    setCartError("");
    setAdding(true);
    try {
      await addItem(pid, count, size);
      showToast(`Added ${product.namee}${size ? ` (${size})` : ""} to your cart`, { to: "/cart", label: "View cart" });
    } catch (error) {
      setCartError(error.response?.data?.error || "Could not add to cart, please try again.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="my-16">
        <Loading />
      </div>
    );
  }
  if (!product) {
    return <NotFound />;
  }

  const discPercents = Math.floor(((product.price - product.sellprice) / product.price) * 100);

  return (
    <div className="page my-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link to="/" className="hover:text-red-600">Home</Link></li>
          <li aria-hidden="true">›</li>
          <li><Link to={`/browseproduct?gender=${product.gender}`} className="hover:text-red-600">{capitalise(product.gender)}</Link></li>
          <li aria-hidden="true">›</li>
          <li>
            <Link to={`/browseproduct?gender=${product.gender}&category=${product.category}`} className="hover:text-red-600">
              {capitalise(product.category)}
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li className="text-gray-900" aria-current="page">{product.namee}</li>
        </ol>
      </nav>

      <Detailedview
        key={product.id}
        product={product}
        discPercents={discPercents}
        onAddToCart={handleAddToCart}
        adding={adding}
        error={cartError}
      />

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related-title">
          <h2 id="related-title" className="section-title mb-6">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((item) => (
              <Cards key={item.id} id={item.id} img={item.img} name={item.namee} orgprice={item.price} sellprice={item.sellprice} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductPage;
