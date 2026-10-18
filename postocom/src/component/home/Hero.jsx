import { NavLink } from "react-router-dom";

function Hero() {
  return (
    <section className="bg-slate-200">
      <div className="page flex flex-col items-center justify-between gap-6 lg:flex-row">
        <img
          src="/images/file.png"
          alt="Model wearing a white top from the new season collection"
          className="h-[45vh] object-contain sm:h-[55vh] lg:order-2 lg:h-[65vh]"
        />
        <div className="flex flex-col items-start gap-5 pb-10 lg:order-1 lg:py-10">
          <p className="eyebrow">New Season Collection</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Get up to 30% off
            <br />
            new arrivals
          </h1>
          <p className="muted max-w-md text-lg">
            Shirts, dresses, kurtas and accessories for everyday wear, with free delivery on every order.
          </p>
          <div className="flex flex-wrap gap-3">
            <NavLink className="btn btn-primary" to="/browseproduct?sort=newest">
              Shop New Arrivals
            </NavLink>
            <NavLink className="btn btn-secondary" to="/browseproduct?sort=popular">
              Best Sellers
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
