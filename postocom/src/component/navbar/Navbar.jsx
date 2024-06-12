import { useEffect, useState } from "react";
import Profile from "./Profile";
import Cart from "./Cart";
import { NavLink, useNavigate } from "react-router-dom";
import Login from "../signupin/Login";
import Register from "../signupin/Register";

function Navbar() {
  const navigate = useNavigate();
  const [logIn, setLogIn] = useState(false);
  const [register, setRegister] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loginstatus, setLogInstatus] = useState(false);
  const localcheck = localStorage.getItem("token");

  useEffect(() => {
    if (localcheck) {
      setLogInstatus(true);
    }
  }, [localcheck]);
  const handleformsearch = () => {
    console.log("handleFormsearch");
  };
  const handleLoginComponent = () => {
    setRegister(false);
    setLogIn(true);
  };
  const handleClose = () => {
    setLogIn(false);
    setRegister(false);
  };

  const handleProfile = () => {
    navigate("/profile");
  }

  const handleregister = () => {
    setLogIn(false);
    setRegister(true);
  };

  return (
    <div className="static">
      <div className="container mx-auto flex justify-between items-center gap-6 m-4">
        <NavLink to="/" className="text-xl font-bold">PosCon</NavLink>
        <div className="hidden md:flex justify-around items-center gap-6">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/about">About</NavLink>
          {!loginstatus ? (
            <button onClick={handleLoginComponent}>Log In</button>
          ) : null}
        </div>
        <div className="flex justify-end items-center gap-2">
          <div className="flex justify-around items-center gap-4">
            <form
              onSubmit={handleformsearch}
              className="flex items-center p-1 bg-slate-200 rounded"
            >
              <input
                type="text"
                placeholder="Search"
                className="flex-1 p-1 bg-transparent border-none focus:outline-none placeholder-slate-400"
              />
              <button className="p-1">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  className="text-slate-700"
                >
                  <path d="M19 11 A8 8 0 0 1 11 19 A8 8 0 0 1 3 11 A8 8 0 0 1 19 11 z" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </form>
            {/* cart */}
            <NavLink to="/cart" className="hidden md:block">
              <Cart />
            </NavLink>
            {/* profile hidden on small screens */}
            {loginstatus ? (
              <button className="hidden md:block" onClick={handleProfile}>
                <Profile />
              </button>
            ) : null}
          </div>
          <div className="relative md:hidden">
            <button
              data-collapse-toggle="navbar-hamburger"
              type="button"
              className="inline-flex items-center justify-center p-2 w-10 h-10 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-controls="navbar-hamburger"
              aria-expanded={isOpen}
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white z-20">
                {/* Optional: Add your Cart component here */}

                <ul className="py-1">
                  <NavLink to="/cart">
                    <Cart />
                  </NavLink>
                  <li>
                    <NavLink
                      to="/"
                      className="block py-2 px-4 text-gray-900 rounded hover:bg-gray-100"
                    >
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/contact"
                      className="block py-2 px-4 text-gray-900 rounded hover:bg-gray-100"
                    >
                      Contact
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/about"
                      className="block py-2 px-4 text-gray-900 rounded hover:bg-gray-100"
                    >
                      About
                    </NavLink>
                  </li>
                  {!loginstatus ? (
                    <li>
                      <button
                        onClick={handleLoginComponent}
                        className="block py-2 px-4 text-gray-900 rounded hover:bg-gray-100"
                      >
                        Log in
                      </button>
                    </li>
                  ) : null}
                  {loginstatus ? (
                    <li>
                      <button
                        className="block py-2 px-4 text-gray-900 rounded hover:bg-gray-100"
                      onClick={handleProfile}
                      >
                        Profile
                      </button>
                    </li>
                  ) : null}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      {logIn ? (
        <Login
          open={logIn}
          handleClose={handleClose}
          handleRegister={handleregister}
        />
      ) : null}
      {register ? (
        <Register
          open={register}
          handleClose={handleClose}
          handleLoginComponent={handleLoginComponent}
        />
      ) : null}
    </div>
  );
}

export default Navbar;
