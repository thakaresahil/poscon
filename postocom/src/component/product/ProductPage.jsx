import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import Detailedview from "../detailed/Detailedview";
import Loading from "../loading/Loading";
import NotFound from "../notfound/NotFound";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, openLogin } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
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

  const handleAddToCart = async (pid, count) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    setCartError("");
    try {
      await api.post("/addtocart", { pid, count });
      navigate("/cart");
    } catch (error) {
      setCartError(error.response?.data?.error || "Could not add to cart, please try again.");
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

  const discPercents = Math.floor(
    ((product.price - product.sellprice) / product.price) * 100
  );

  return (
    <div className="my-12">
      <Detailedview
        id={product.id}
        img={product.img}
        name={product.namee}
        orgprice={product.price}
        sellprice={product.sellprice}
        description={product.description}
        discPercents={discPercents}
        onAddToCart={handleAddToCart}
      />
      {cartError && (
        <p className="container mx-auto text-red-700 text-sm mt-4">{cartError}</p>
      )}
    </div>
  );
}

export default ProductPage;
