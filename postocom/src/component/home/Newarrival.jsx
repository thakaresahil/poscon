import api from "../../api/client";
import { useEffect, useState } from "react";
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
    <div className="container mx-auto my-28">
      <div className="flex flex-col justify-around items-center my-20 gap-2">
        <h1 className="text-4xl">New Arrivals</h1>
        <div className="border-4 border-red-500 w-20"></div>
      </div>
      <div className="flex flex-wrap mx-24 gap-6 justify-around items-center my-8">
        {loading ? (
          <Loading />
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
            <p>No new arrivals found.</p>
          )
        )}
      </div>
    </div>
  );
}

export default Newarrival;
