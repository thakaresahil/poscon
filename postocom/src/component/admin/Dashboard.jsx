import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import Loading from "../loading/Loading";
import AdminLayout from "./AdminLayout";
import SalesChart from "./SalesChart";
import OrderStatus from "../orders/OrderStatus";
import PaymentStatus from "../orders/PaymentStatus";
import { formatDate, formatOrderNumber } from "../../utils/format";

function StatTile({ label, value, hint }) {
  return (
    <div className="bg-gray-50 rounded p-4 flex flex-col gap-1">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
      {hint && <p className="text-gray-500 text-sm">{hint}</p>}
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((response) => setStats(response.data))
      .catch(() => setError("Could not load the dashboard, please try again."));
  }, []);

  return (
    <AdminLayout>
      {error && <p className="text-red-700">{error}</p>}
      {!stats && !error && <Loading />}
      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              label="Revenue"
              value={`₹${stats.revenue.toLocaleString("en-IN")}`}
              hint="Paid and cash on delivery, excluding cancelled"
            />
            <StatTile label="Orders" value={stats.orders} hint={`${stats.orders_to_ship} waiting to ship`} />
            <StatTile label="Customers" value={stats.customers} />
            <StatTile
              label="Products"
              value={stats.products}
              hint={
                stats.new_messages > 0 ? (
                  <Link to="/admin/messages?status=new" className="link">
                    {stats.new_messages} unread {stats.new_messages === 1 ? "message" : "messages"}
                  </Link>
                ) : "No unread messages"
              }
            />
          </div>

          <div className="bg-white border rounded p-4">
            <SalesChart data={stats.daily} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-3">Top Selling Products</h2>
              {stats.topProducts.length === 0 ? (
                <p className="text-gray-500">No sales yet.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2">Product</th>
                      <th className="py-2 text-right">Units</th>
                      <th className="py-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts.map((product) => (
                      <tr key={`${product.product_id}-${product.name}`} className="border-b border-gray-100">
                        <td className="py-2">{product.name}</td>
                        <td className="py-2 text-right">{product.sold}</td>
                        <td className="py-2 text-right">₹{product.revenue.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="border rounded p-4">
              <div className="flex justify-between mb-3">
                <h2 className="font-semibold">Recent Orders</h2>
                <Link to="/admin/orders" className="link text-sm">
                  View all
                </Link>
              </div>
              {stats.recentOrders.length === 0 ? (
                <p className="text-gray-500">No orders yet.</p>
              ) : (
                <ul className="flex flex-col gap-3 text-sm">
                  {stats.recentOrders.map((order) => (
                    <li key={order.id} className="flex justify-between items-center gap-2">
                      <div>
                        <p className="font-semibold">{formatOrderNumber(order.id)}</p>
                        <p className="text-gray-500">
                          {order.email} · {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p>₹{order.total}</p>
                        <div className="flex gap-1">
                          <OrderStatus status={order.status} />
                          <PaymentStatus status={order.payment_status} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default Dashboard;
