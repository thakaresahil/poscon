import React from "react";
import { Link } from "react-router-dom";

function Acat() {
  return (
    <section className="page my-10" aria-label="Shop by category">
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        <Link
          to="/browseproduct?gender=women"
          className="group block relative aspect-[4/3] overflow-hidden rounded-lg"
        >
          <img
            src="/images/acatoneforcat.jpg"
            alt="women's collection"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <p className="absolute inset-0 flex items-center justify-center bg-black/25 text-xl font-bold tracking-wider text-white transition-colors hover:bg-black/40">WOMEN'S</p>
        </Link>
        <Link
          to="/browseproduct?category=accessories"
          className="group block relative aspect-[4/3] overflow-hidden rounded-lg"
        >
          <img
            src="/images/accessoriescat.jpg"
            alt="accessories collection"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <p className="absolute inset-0 flex items-center justify-center bg-black/25 text-xl font-bold tracking-wider text-white transition-colors hover:bg-black/40">ACCESSORIES</p>
        </Link>
        <Link
          to="/browseproduct?gender=men"
          className="group block relative aspect-[4/3] overflow-hidden rounded-lg"
        >
          <img
            src="/images/acatthreeforcat.jpg"
            alt="men's collection"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <p className="absolute inset-0 flex items-center justify-center bg-black/25 text-xl font-bold tracking-wider text-white transition-colors hover:bg-black/40">MEN'S</p>
        </Link>
      </div>
    </section>
  );
}

export default Acat;
