import React from "react";
import { useNavigate } from "react-router-dom";

function Dayweek() {
  const navigate = useNavigate();

  const handleShop = () =>{
    navigate("/browseproduct");
  }
  return (
    <div className="bg-slate-200">
      <div className="container mx-auto flex flex-col lg:flex-row  justify-around items-center px-8  my-12">
        <img
          src="./images/blkpng.png"
          alt="blk Person"
          className="h-[55vh] md:h-[65vh]"
        />
        <div className="flex flex-col justify-around items-center gap-16 my-8">
          <div className="flex  flex-col items-center justify-around gap-2">
            <h2 className="text-3xl">Deal Of The Week</h2>
            <div className="border-4 border-red-500 w-20 "></div>
          </div>
          <div className="flex justify-around items-center gap-4">
            <div className="flex flex-col justify-around items-center bg-white rounded-full px-6 py-3">
              <h2 className="text-4xl text-red-500 font-bold ">04</h2>
              <p>Days</p>
            </div>
            <div className="flex flex-col justify-around items-center bg-white rounded-full px-6 py-3">
              <h2 className="text-4xl text-red-500 font-bold ">23</h2>
              <p>Hours</p>
            </div>
            <div className="flex flex-col justify-around items-center bg-white rounded-full px-6 py-3">
              <h2 className="text-4xl text-red-500 font-bold ">58</h2>
              <p>Mins</p>
            </div>
            <div className="flex flex-col justify-around items-center bg-white rounded-full px-6 py-3">
              <h2 className="text-4xl text-red-500 font-bold ">52</h2>
              <p>Sec</p>
            </div>
          </div>
          <button className="px-6 py-2 bg-black  text-white rounded-md transition-transform duration-300 hover:scale-105" onClick={handleShop}>
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dayweek;
