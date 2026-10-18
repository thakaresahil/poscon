import Footer from "./component/footer/Footer";
import Home from "./component/home/Home";
import Navbar from "./component/navbar/Navbar";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./component/routing/ProtectedRoute";
import Productbrowse from "./component/product/Productbrowse";
import ProductPage from "./component/product/ProductPage";
import Profile from "./component/profile/Profile";
import About from "./component/about/About";
import Contact from "./component/contact/Contact";
import Carthole from "./component/Carthold/Carthole";
import NotFound from "./component/notfound/NotFound";
import Checkout from "./component/checkout/Checkout";
import Orders from "./component/orders/Orders";
import OrderDetail from "./component/orders/OrderDetail";
import Payment from "./component/payment/Payment";
import AdminRoute from "./component/routing/AdminRoute";
import Dashboard from "./component/admin/Dashboard";
import AdminProducts from "./component/admin/AdminProducts";
import ProductForm from "./component/admin/ProductForm";
import AdminOrders from "./component/admin/AdminOrders";

const commonLayout = (component) => (
  <>
    <Navbar />
    {component}
    <Footer />
  </>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: commonLayout(<Home />),
  },
  {
    path: "/browseproduct",
    element: commonLayout(<Productbrowse />),
  },
  {
    path: "/product/:id",
    element: commonLayout(<ProductPage />),
  },
  {
    path: "/profile",
    element: commonLayout(
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/about",
    element: commonLayout(<About />),
  },
  {
    path: "/contact",
    element: commonLayout(<Contact />),
  },
  {
    path: "/cart",
    element: commonLayout(
      <ProtectedRoute>
        <Carthole />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checkout",
    element: commonLayout(
      <ProtectedRoute>
        <Checkout />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders",
    element: commonLayout(
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders/:id",
    element: commonLayout(
      <ProtectedRoute>
        <OrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders/:id/pay",
    element: commonLayout(
      <ProtectedRoute>
        <Payment />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: commonLayout(
      <AdminRoute>
        <Dashboard />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/products",
    element: commonLayout(
      <AdminRoute>
        <AdminProducts />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/products/new",
    element: commonLayout(
      <AdminRoute>
        <ProductForm />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/products/:id/edit",
    element: commonLayout(
      <AdminRoute>
        <ProductForm />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/orders",
    element: commonLayout(
      <AdminRoute>
        <AdminOrders />
      </AdminRoute>
    ),
  },
  {
    path: "*",
    element: commonLayout(<NotFound />),
  },
]);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
