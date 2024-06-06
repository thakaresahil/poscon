import Acat from "./Acat";
import Bestseller from "./Bestseller";
import Dayweek from "./Dayweek";
import Hero from "./Hero";
import Littledetails from "./Littledetails";
import Newarrival from "./Newarrival";


function Home() {
 

  return (
    <div>
      <Hero />
      <Acat />
      <Newarrival/>
      <Littledetails/>
      <Dayweek/>
      <Bestseller/>
      
    </div>
  );
}

export default Home;
