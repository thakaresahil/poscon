import React from "react";
import { Link } from "react-router-dom";

const columns = [
  {
    title: "Shop",
    links: [
      ["New Arrivals", "/browseproduct?sort=newest"],
      ["Best Sellers", "/browseproduct?sort=popular"],
      ["Women", "/browseproduct?gender=women"],
      ["Men", "/browseproduct?gender=men"],
      ["Accessories", "/browseproduct?category=accessories"],
    ],
  },
  {
    title: "Help",
    links: [
      ["FAQs", "/faqs"],
      ["Shipping & Returns", "/shipping-returns"],
      ["Contact Us", "/contact"],
      ["My Orders", "/orders"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Us", "/about"],
      ["Privacy Policy", "/privacy"],
      ["Terms of Use", "/terms"],
    ],
  },
];

function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Pos<span className="text-red-500">con</span>
          </Link>
          <p className="muted text-sm">
            Everyday clothing and accessories for men and women, delivered across India.
          </p>
          <p className="text-sm text-gray-500">
            This is a demo store: no real orders are shipped and no real payments are taken.
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">{column.title}</h2>
            <ul className="flex flex-col gap-2">
              {column.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-gray-600 hover:text-red-600">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-gray-200">
        <p className="page py-4 text-sm text-gray-500">© {new Date().getFullYear()} Poscon. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
