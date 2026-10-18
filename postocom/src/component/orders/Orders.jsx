import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import api from "../../api/client";
import Loading from "../loading/Loading";
import OrderStatus from "./OrderStatus";
import { formatDate, formatOrderNumber } from "../../utils/format";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(response.data);
      } catch (err) {
        setError("Could not load your orders, please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="my-16">
        <Loading />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto h-[60vh] flex flex-col justify-center items-center gap-4">
        <h1 className="text-3xl">{error || "You haven't placed any orders yet"}</h1>
        <NavLink
          to="/browseproduct"
          className="px-6 py-2 bg-red-500 text-white rounded-md transition-transform duration-300 hover:scale-105"
        >
          Start Shopping
        </NavLink>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-16 w-full lg:w-2/3 flex flex-col gap-4">
      <h1 className="text-3xl mb-4">My Orders</h1>
      {orders.map((order) => (
        <Link
          key={order.id}
          to={`/orders/${order.id}`}
          className="flex gap-6 items-center p-4 bg-gray-50 rounded hover:shadow-lg transition"
        >
          {order.img && <img src={order.img} alt="" className="h-24" />}
          <div className="flex-1">
            <p className="font-semibold text-lg">Order {formatOrderNumber(order.id)}</p>
            <p className="text-gray-500">
              {formatDate(order.created_at)} · {order.item_count}{" "}
              {order.item_count === 1 ? "item" : "items"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="font-semibold text-lg">₹{order.total}</p>
            <OrderStatus status={order.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}

export default Orders;
