import React from "react";
import { CiFacebook } from "react-icons/ci";
import { IoLogoTwitter } from "react-icons/io";
import { FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <div className="bg-gray-100 h-40 mt-6">
      <div className="container mx-auto flex justify-between py-8">
        <div className="flex flex-col gap-8 justify-between">
          <div className="flex justify-start gap-8 items-center">
            <p>Blog</p>
            <p>FAQs</p>
            <p>Contact us</p>
          </div>
          <p>©️{(new Date().getFullYear())} All rights reserved.</p>
        </div>
        <div className="flex justify-end gap-8 ">
          <CiFacebook />
          <IoLogoTwitter />
          <FaInstagram />
        </div>
      </div>
    </div>
  );
}

export default Footer;
