import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

// The deal runs until the end of the current week (Sunday, 23:59:59 local time)
const endOfWeek = (now) => {
  const end = new Date(now);
  end.setDate(now.getDate() + ((7 - now.getDay()) % 7));
  end.setHours(23, 59, 59, 999);
  return end;
};

const timeLeft = (now) => {
  const seconds = Math.max(0, Math.floor((endOfWeek(now) - now) / 1000));
  return [
    ["Days", Math.floor(seconds / 86400)],
    ["Hours", Math.floor((seconds % 86400) / 3600)],
    ["Mins", Math.floor((seconds % 3600) / 60)],
    ["Secs", seconds % 60],
  ];
};

function Dayweek() {
  const [now, setNow] = useState(() => new Date());
  const [deal, setDeal] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // The deal is the product with the biggest discount right now
  useEffect(() => {
    api
      .get("/products", { params: { sort: "discount", limit: 1 } })
      .then((response) => setDeal(response.data.products[0] || null))
      .catch(() => setDeal(null));
  }, []);

  const discount = deal ? Math.floor(((deal.price - deal.sellprice) / deal.price) * 100) : 0;

  return (
    <section className="my-12 bg-slate-200">
      <div className="page flex flex-col items-center justify-around gap-8 lg:flex-row">
        <img
          src="/images/blkpng.png"
          alt="Model in a black outfit"
          className="h-[45vh] object-contain md:h-[60vh]"
        />
        <div className="flex flex-col items-center gap-8 pb-10 text-center lg:py-10">
          <div className="flex flex-col items-center gap-2">
            <p className="eyebrow">Ends Sunday</p>
            <h2 className="section-title">Deal of the Week</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4" role="timer" aria-label="Time left for this deal">
            {timeLeft(now).map(([label, value]) => (
              <div key={label} className="flex w-16 flex-col items-center rounded-2xl bg-white py-3 sm:w-20">
                <span className="text-3xl font-bold text-red-500 sm:text-4xl">{String(value).padStart(2, "0")}</span>
                <span className="text-sm text-gray-600">{label}</span>
              </div>
            ))}
          </div>
          {deal && (
            <Link
              to={`/product/${deal.id}`}
              className="card flex w-full max-w-sm items-center gap-4 p-3 text-left transition-shadow hover:shadow-lg"
            >
              <img src={deal.img} alt="" className="h-20 w-16 rounded-md bg-gray-50 object-cover" />
              <div>
                <p className="font-semibold">{deal.namee}</p>
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="price">₹{deal.sellprice}</span>
                  <span className="price-old">₹{deal.price}</span>
                  <span className="discount">({discount}% OFF)</span>
                </p>
              </div>
            </Link>
          )}
          <Link className="btn btn-dark" to={deal ? `/product/${deal.id}` : "/browseproduct?sort=discount"}>
            Shop the Deal
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Dayweek;
