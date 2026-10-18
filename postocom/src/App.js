import Footer from "./component/footer/Footer";
import Home from "./component/home/Home";
import Navbar from "./component/navbar/Navbar";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./component/routing/ProtectedRoute";
import Productbrowse from "./component/product/Productbrowse";
import ProductPage from "./component/product/ProductPage";
import Profile from "./component/profile/Profile";
import About from "./component/about/About";
import Contact from "./component/contact/Contact";
import Carthole from "./component/Carthold/Carthole";
import NotFound from "./component/notfound/NotFound";

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
    path: "*",
    element: commonLayout(<NotFound />),
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
