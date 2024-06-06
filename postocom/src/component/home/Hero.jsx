import React from "react";

function Hero() {
  return (
    <div className="flex flex-col lg:flex-row bg-slate-200 justify-around items-center px-8">
  <img
    src="./images/file.png"
    alt="girl offer letter"
    className="h-[55vh] lg:order-2 lg:h-[65vh]"
  />
  <div className="flex flex-col justify-around items-start gap-6 lg:order-1 my-10">
    <p>SPRING / SUMMER COLLECTION 2024</p>
    <h2 className="text-3xl">Get up to 30% Off New Arrivals</h2>
    <button className="px-6 py-2 bg-red-500 text-white rounded-md transition-transform duration-300 hover:scale-105">
      Shop Now
    </button>
  </div>
</div>
  );
}

export default Hero;
