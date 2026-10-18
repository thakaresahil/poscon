import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import Loading from "../loading/Loading";
import NotFound from "../notfound/NotFound";
import OrderStatus from "./OrderStatus";
import { formatDate, formatOrderNumber } from "../../utils/format";

function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [justPlaced] = useState(Boolean(location.state?.placed));
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // Clear the flag so the thank-you message is not shown again on reload
  useEffect(() => {
    if (location.state?.placed) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="my-16">
        <Loading />
      </div>
    );
  }
  if (!order) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto my-16 w-full lg:w-2/3 flex flex-col gap-6">
      {justPlaced && (
        <div className="bg-green-100 text-green-800 p-4 rounded">
          <p className="font-semibold text-lg">Thank you, your order has been placed!</p>
          <p>We'll get it to you soon.</p>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">Order {formatOrderNumber(order.id)}</h1>
          <p className="text-gray-500">Placed on {formatDate(order.created_at)}</p>
        </div>
        <OrderStatus status={order.status} />
      </div>

      <div className="flex flex-col gap-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 items-center">
            <img src={item.img} alt={item.product_name} className="h-24" />
            <div className="flex-1">
              {item.product_id ? (
                <Link to={`/product/${item.product_id}`} className="hover:underline">
                  {item.product_name}
                </Link>
              ) : (
                <p>{item.product_name}</p>
              )}
              <p className="text-gray-500 text-sm">
                ₹{item.price} x {item.quantity}
              </p>
            </div>
            <p className="font-semibold">₹{item.price * item.quantity}</p>
          </div>
        ))}
      </div>
      <hr />
      <div className="flex justify-between font-semibold text-xl">
        <p>Total</p>
        <p>₹{order.total}</p>
      </div>

      {order.ship_address && (
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="font-semibold mb-2">Shipping To</h2>
          <p>{order.ship_name}</p>
          <p>{order.ship_address}</p>
          <p>
            {order.ship_city} - {order.ship_pincode}
          </p>
          <p>Phone: {order.ship_phone}</p>
        </div>
      )}

      <Link to="/orders" className="text-blue-600 hover:underline">
        ← Back to My Orders
      </Link>
    </div>
  );
}

export default OrderDetail;
