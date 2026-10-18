import React from 'react';
import { FaTruck, FaRegClock } from "react-icons/fa";
import { BsCash } from "react-icons/bs";
import { GiAnticlockwiseRotation } from "react-icons/gi";

const perks = [
  { Icon: FaTruck, title: "Free Delivery", text: "On every order, with no minimum spend." },
  { Icon: BsCash, title: "Cash on Delivery", text: "Pay when your order arrives, or pay online." },
  { Icon: GiAnticlockwiseRotation, title: "Easy 7-Day Returns", text: "Changed your mind? Return unused items within 7 days." },
  { Icon: FaRegClock, title: "Here to Help", text: "Support from 10am to 7pm, Monday to Saturday." },
];

function Littledetails() {
  return (
    <section className="page my-12" aria-label="Why shop with us">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {perks.map(({ Icon, title, text }) => (
          <li key={title} className="flex items-start gap-4 rounded-lg bg-gray-50 p-5">
            <Icon className="mt-1 shrink-0 text-2xl text-red-500" aria-hidden="true" />
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="muted text-sm">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Littledetails;
