import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
];

function AdminLayout({ children }) {
  return (
    <div className="container mx-auto my-12 px-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl">Admin</h1>
        <nav className="flex gap-2" aria-label="Admin sections">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `px-4 py-2 rounded border ${
                  isActive ? "border-red-500 text-red-500 font-semibold" : "border-gray-300"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}

export default AdminLayout;
