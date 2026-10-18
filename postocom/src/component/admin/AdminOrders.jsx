import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/client";
import Loading from "../loading/Loading";
import AdminLayout from "./AdminLayout";
import OrderStatus from "../orders/OrderStatus";
import PaymentStatus from "../orders/PaymentStatus";
import { formatDate, formatOrderNumber, orderStatusLabels } from "../../utils/format";

// Matches the transitions the API allows
const nextStatuses = {
  placed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const filters = ["", "placed", "shipped", "delivered", "cancelled"];

function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "";
  const page = Number(searchParams.get("page")) || 1;
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    setResult(null);
    const params = { page };
    if (status) params.status = status;
    api
      .get("/admin/orders", { params })
      .then((response) => setResult(response.data))
      .catch(() => setError("Could not load orders, please try again."));
  }, [status, page]);

  const changeStatus = async (order, newStatus) => {
    setError("");
    setUpdating(order.id);
    try {
      const response = await api.patch(`/admin/orders/${order.id}`, { status: newStatus });
      setResult((current) => ({
        ...current,
        orders: current.orders.map((item) =>
          item.id === order.id ? { ...item, status: response.data.status } : item
        ),
      }));
    } catch (err) {
      setError(err.response?.data?.error || "Could not update the order.");
    } finally {
      setUpdating(null);
    }
  };

  const goToPage = (number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", number);
    setSearchParams(next);
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap gap-2" aria-label="Filter by status">
        {filters.map((filter) => (
          <button
            key={filter || "all"}
            className={`px-4 py-1 rounded-full border ${
              status === filter ? "border-red-500 text-red-500 font-semibold" : "border-gray-300"
            }`}
            onClick={() => setSearchParams(filter ? { status: filter } : {})}
          >
            {filter ? orderStatusLabels[filter] : "All"}
          </button>
        ))}
      </div>

      {error && <p className="text-red-700">{error}</p>}
      {!result ? (
        <Loading />
      ) : result.orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Order</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Items</th>
                <th className="py-2 pr-6 text-right">Total</th>
                <th className="py-2">Status</th>
                <th className="py-2">Update</th>
              </tr>
            </thead>
            <tbody>
              {result.orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 align-top">
                  <td className="py-2">
                    <p className="font-semibold">{formatOrderNumber(order.id)}</p>
                    <p className="text-gray-500">{formatDate(order.created_at)}</p>
                  </td>
                  <td className="py-2">
                    <p>{order.email}</p>
                    {order.ship_city && <p className="text-gray-500">{order.ship_city}</p>}
                  </td>
                  <td className="py-2 max-w-xs">{order.items}</td>
                  <td className="py-2 pr-6 text-right">₹{order.total}</td>
                  <td className="py-2">
                    <div className="flex flex-col items-start gap-1">
                      <OrderStatus status={order.status} />
                      <PaymentStatus status={order.payment_status} />
                    </div>
                  </td>
                  <td className="py-2">
                    {nextStatuses[order.status].length === 0 ? (
                      <span className="text-gray-400">No changes</span>
                    ) : (
                      <select
                        aria-label={`Update status of order ${formatOrderNumber(order.id)}`}
                        className="border rounded p-1"
                        value=""
                        disabled={updating === order.id}
                        onChange={(event) => changeStatus(order, event.target.value)}
                      >
                        <option value="" disabled>
                          Mark as...
                        </option>
                        {nextStatuses[order.status].map((option) => (
                          <option key={option} value={option}>
                            {orderStatusLabels[option]}
                          </option>
                        ))}
                      </select>
                    )}
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

export default AdminOrders;
