import Footer from "./component/footer/Footer";
import Home from "./component/home/Home";
import Navbar from "./component/navbar/Navbar";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./component/signupin/Login";
import Productbrowse from "./component/product/Productbrowse";
import Profile from "./component/profile/Profile";
import About from "./component/about/About";
import Contact from "./component/contact/Contact";
import Carthole from "./component/Carthold/Carthole";

function App() {
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
      path: "/login",
      element: commonLayout(<Login/>),
    },
    {
      path: "/browseproduct",
      element: commonLayout(<Productbrowse/>),
    },
    {
      path: "/profile",
      element: commonLayout(<Profile/>),
    },
    {
      path: "/about",
      element: commonLayout(<About/>),
    },
    {
      path: "/contact",
      element: commonLayout(<Contact/>),
    },
    {
      path: "/cart",
      element: commonLayout(<Carthole/>),
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
