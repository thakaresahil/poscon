import { NavLink } from "react-router-dom";

function NotFound() {
  return (
    <div className="container mx-auto h-[60vh] flex flex-col justify-center items-center gap-4">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <p className="text-xl">Sorry, we couldn't find that page.</p>
      <NavLink
        to="/"
        className="btn btn-primary"
      >
        Back to Home
      </NavLink>
    </div>
  );
}

export default NotFound;
