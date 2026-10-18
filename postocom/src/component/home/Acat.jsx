import React from "react";
import { Link } from "react-router-dom";

function Acat() {
  return (
    <div className="page my-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-around items-center gap-6">
        <Link
          to="/browseproduct?gender=women"
          className="block relative w-full max-w-sm overflow-hidden rounded-lg transform transition-transform duration-300 hover:scale-105"
        >
          <img
            src="./images/acatoneforcat.jpg"
            alt="women's collection"
            className="w-full h-auto"
          />
          <p className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">WOMEN'S</p>
        </Link>
        <Link
          to="/browseproduct?category=accessories"
          className="block relative w-full max-w-sm overflow-hidden rounded-lg transform transition-transform duration-300 hover:scale-105"
        >
          <img
            src="./images/accessoriescat.jpg"
            alt="accessories collection"
            className=""
          />
          <p className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">ACCESSORIES</p>
        </Link>
        <Link
          to="/browseproduct?gender=men"
          className="block relative w-full max-w-sm overflow-hidden rounded-lg transform transition-transform duration-300 hover:scale-105"
        >
          <img
            src="./images/acatthreeforcat.jpg"
            alt="men's collection"
            className=""
          />
          <p className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">MEN'S</p>
        </Link>
      </div>
    </div>
  );
}

export default Acat;
