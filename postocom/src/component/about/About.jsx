import React from "react";
import { Link } from "react-router-dom";

const values = [
  ["Everyday quality", "Breathable fabrics and simple cuts you can wear to work, to college or out with friends."],
  ["Fair prices", "Most of our range is 30 to 40 percent below the original price, with free delivery on every order."],
  ["Easy shopping", "Search and filters to find things quickly, cash on delivery, and returns within 7 days."],
];

const stack = [
  ["Frontend", "React, React Router and Tailwind CSS"],
  ["Backend", "Node.js and Express with JWT authentication and zod validation"],
  ["Database", "PostgreSQL with migrations, transactions and trigram search indexes"],
  ["Quality", "Unit, API and end-to-end tests run on every change with GitHub Actions"],
];

function About() {
  return (
    <div className="my-12 flex flex-col gap-16">
      <section className="page max-w-3xl text-center">
        <p className="eyebrow">About Poscon</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Clothing for everyday life</h1>
        <p className="muted mt-4 text-lg">
          Poscon is an online store for men's and women's clothing and accessories: shirts, kurtas,
          dresses, jeans, jackets, watches and more. We keep the range small and the prices honest,
          so finding something you like is quick.
        </p>
      </section>

      <section className="page">
        <ul className="grid gap-4 md:grid-cols-3">
          {values.map(([title, text]) => (
            <li key={title} className="card p-6">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="muted mt-2">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="page grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow">Behind the store</p>
            <h2 className="section-title mt-2">How Poscon is built</h2>
            <p className="muted mt-3">
              Poscon is a full-stack demo project. Everything a real store needs is here, from accounts and
              carts to checkout, simulated payments, order tracking and an admin dashboard. No real orders
              are shipped and no money is taken.
            </p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {stack.map(([title, text]) => (
              <div key={title} className="rounded-lg bg-white p-4">
                <dt className="font-semibold">{title}</dt>
                <dd className="muted mt-1 text-sm">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="page flex flex-col items-center gap-4 text-center">
        <h2 className="section-title">Ready to look around?</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/browseproduct" className="btn btn-primary">Start Shopping</Link>
          <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
        </div>
      </section>
    </div>
  );
}

export default About;
