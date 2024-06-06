import React from "react";

function Acat() {
  return (
    <div className="container mx-auto my-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-around items-center gap-6">
        <div className="relative w-96  transform transition-transform duration-300 hover:scale-105">
          <img
            src="./images/acatoneforcat.jpg"
            alt="women accessories"
            className="w-full h-auto"
          />
          <p className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">WOMEN'S</p>
        </div>
        <div className="relative w-96  transform transition-transform duration-300 hover:scale-105">
          <img
            src="./images/accessoriescat.jpg"
            alt="women accessories"
            className=""
          />
          <p className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">ACCESSORIES</p>
        </div>
        <div className="relative w-96  transform transition-transform duration-300 hover:scale-105">
          <img
            src="./images/acatthreeforcat.jpg"
            alt="women accessories"
            className=""
          />
          <p className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">MEN'S</p>
        </div>
      </div>
    </div>
  );
}

export default Acat;
