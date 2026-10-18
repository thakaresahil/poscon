import api from "../../api/client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cards from "../cards/Cards";
import Loading from "../loading/Loading";

function Newarrival() {
  const [newarrival, setNewarrival] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/data");
        setNewarrival(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="page my-16">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <p className="eyebrow">Just In</p>
        <h2 className="section-title">New Arrivals</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-full"><Loading /></div>
        ) : (
          newarrival.length > 0 ? (
            newarrival.map((newItem) => (
              <Cards
                key={newItem.id}
                id={newItem.id}
                img={newItem.img}
                name={newItem.namee}
                orgprice={newItem.price}
                sellprice={newItem.sellprice}
              />
            ))
          ) : (
            <p className="col-span-full muted">No new arrivals found.</p>
          )
        )}
      </div>
      <div className="mt-8 text-center">
        <Link to="/browseproduct?sort=newest" className="btn btn-secondary">View all new arrivals</Link>
      </div>
    </section>
  );
}

export default Newarrival;
