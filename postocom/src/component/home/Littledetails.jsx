import React from 'react';
import { FaTruck } from "react-icons/fa";
import { BsCash } from "react-icons/bs";
import { GiAnticlockwiseRotation } from "react-icons/gi";
import { FaRegClock } from "react-icons/fa";

function Littledetails() {
  return (
    <div className="container mx-auto flex flex-wrap items-center justify-around gap-1">
        <div className="flex justify-around items-center bg-gray-100 gap-4  p-6 ">
        <FaTruck className="text-3xl text-red-500"/>
            <div>
            <h3 className="font-bold">FREE SHIPPING</h3>
            <p>Suffered Aleration in Some Form</p>
            </div>
        </div>
        <div className="flex justify-around items-center  bg-gray-100  gap-4 p-6 ">
        <BsCash className="text-3xl text-red-500"/>
            <div>
            <h3 className="font-bold ">FREE SHIPPING</h3>
            <p>Suffered Aleration in Some Form</p>
            </div>
        </div>
        <div className="flex justify-around items-center bg-gray-100  gap-4  p-6 ">
        <GiAnticlockwiseRotation className="text-3xl text-red-500"/>
            <div>
            <h3 className="font-bold ">FREE SHIPPING</h3>
            <p>Suffered Aleration in Some Form</p>
            </div>
        </div>
        <div className="flex justify-around items-center bg-gray-100 gap-4 p-6 ">
        <FaRegClock className="text-3xl text-red-500"/>
            <div>
            <h3 className="font-bold ">FREE SHIPPING</h3>
            <p>Suffered Aleration in Some Form</p>
            </div>
        </div>
    </div>
  )
}

export default Littledetails;