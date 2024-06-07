import Footer from "./component/footer/Footer";
import Home from "./component/home/Home";
import Navbar from "./component/navbar/Navbar";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./component/signupin/Login";
import Productbrowse from "./component/product/Productbrowse";

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
    
  ]);
  return <RouterProvider router={router} />;
}

export default App;
