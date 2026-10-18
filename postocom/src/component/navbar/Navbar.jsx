import { useEffect, useState } from "react";
import Profile from "./Profile";
import Cart from "./Cart";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Login from "../signupin/Login";
import Register from "../signupin/Register";
import ForgotPassword from "../signupin/ForgotPassword";
import { useAuth } from "../../context/AuthContext";

const SearchIcon = () => (
  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" height="1.1em" width="1.1em" aria-hidden="true">
    <path d="M19 11 A8 8 0 0 1 11 19 A8 8 0 0 1 3 11 A8 8 0 0 1 19 11 z" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const navLinkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;
const mobileLinkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 ${isActive ? "bg-red-50 font-semibold text-red-600" : "text-gray-800 hover:bg-gray-100"}`;

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    isLoggedIn: loginstatus,
    isAdmin,
    logout,
    authDialog,
    openLogin,
    openRegister,
    closeAuthDialog,
  } = useAuth();

  // Keep the search box in sync with the search shown on the browse page
  useEffect(() => {
    if (location.pathname === "/browseproduct") {
      setSearchTerm(new URLSearchParams(location.search).get("q") || "");
    }
  }, [location]);

  // Close the mobile menu after navigating
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleformsearch = (event) => {
    event.preventDefault();
    const term = searchTerm.trim();
    navigate(term ? `/browseproduct?q=${encodeURIComponent(term)}` : "/browseproduct");
  };

  const handleLoginComponent = () => {
    setIsOpen(false);
    openLogin();
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/");
  };

  const searchForm = (extraClass) => (
    <form
      role="search"
      onSubmit={handleformsearch}
      className={`flex items-center rounded-md bg-gray-100 px-2 focus-within:ring-2 focus-within:ring-red-200 ${extraClass}`}
    >
      <input
        type="search"
        name="search"
        aria-label="Search products"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search products"
        className="min-w-0 flex-1 bg-transparent px-1 py-2 outline-none placeholder-gray-500"
      />
      <button type="submit" className="p-1 text-gray-700" aria-label="Search">
        <SearchIcon />
      </button>
    </form>
  );

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="page flex items-center justify-between gap-4 py-3">
        <NavLink to="/" className="text-xl font-bold tracking-tight">
          Pos<span className="text-red-500">con</span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/browseproduct" className={navLinkClass}>Shop</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
          {loginstatus ? <NavLink to="/orders" className={navLinkClass}>My Orders</NavLink> : null}
          {isAdmin ? <NavLink to="/admin" className={navLinkClass}>Admin</NavLink> : null}
        </nav>

        <div className="flex items-center gap-2">
          {searchForm("hidden w-56 md:flex")}
          <NavLink to="/cart" aria-label="Cart">
            <Cart />
          </NavLink>
          {loginstatus ? (
            <NavLink to="/profile" className="hidden lg:block" aria-label="My account">
              <Profile />
            </NavLink>
          ) : null}
          <div className="hidden lg:block">
            {!loginstatus ? (
              <button className="btn btn-primary btn-sm" onClick={handleLoginComponent}>Log In</button>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Log Out</button>
            )}
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 lg:hidden"
            aria-controls="navbar-hamburger"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              {isOpen ? (
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M2 1l13 12M15 1L2 13" />
              ) : (
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className="page pb-3 md:hidden">{searchForm("flex w-full")}</div>

      {isOpen && (
        <nav id="navbar-hamburger" className="page border-t border-gray-100 pb-4 pt-2 lg:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            <li><NavLink to="/" end className={mobileLinkClass}>Home</NavLink></li>
            <li><NavLink to="/browseproduct" className={mobileLinkClass}>Shop</NavLink></li>
            <li><NavLink to="/about" className={mobileLinkClass}>About</NavLink></li>
            <li><NavLink to="/contact" className={mobileLinkClass}>Contact</NavLink></li>
            <li><NavLink to="/cart" className={mobileLinkClass}>Cart</NavLink></li>
            {loginstatus ? (
              <>
                <li><NavLink to="/orders" className={mobileLinkClass}>My Orders</NavLink></li>
                <li><NavLink to="/profile" className={mobileLinkClass}>My Account</NavLink></li>
                {isAdmin ? <li><NavLink to="/admin" className={mobileLinkClass}>Admin</NavLink></li> : null}
                <li>
                  <button className="block w-full rounded-md px-3 py-2 text-left text-gray-800 hover:bg-gray-100" onClick={handleLogout}>
                    Log out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button className="btn btn-primary mt-2 w-full" onClick={handleLoginComponent}>
                  Log in
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}

      {authDialog === "login" ? (
        <Login open handleClose={closeAuthDialog} handleRegister={openRegister} />
      ) : null}
      {authDialog === "register" ? (
        <Register open handleClose={closeAuthDialog} handleLoginComponent={openLogin} />
      ) : null}
      {authDialog === "forgot" ? (
        <ForgotPassword open handleClose={closeAuthDialog} handleLoginComponent={openLogin} />
      ) : null}
    </header>
  );
}

export default Navbar;
