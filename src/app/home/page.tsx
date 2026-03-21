import type { Metadata } from "next";
import Home from "./home";
import "../globals.css";

 export const metadata: Metadata = {
   title: "Motorhomes For Sale – Australia’s Marketplace for New & Used Caravans",
   description:
     "Browse new & used motorhomes for sale across Australia. Compare prices on off-road, hybrid, pop top, touring, luxury models with size, weight & sleeping capacity.",
   robots: "index, follow",
   openGraph: {
     title: "Motorhomes For Sale – Australia’s Marketplace for New & Used Caravans",
     description:
       "Browse new & used motorhomes for sale across Australia. Compare prices on off-road, hybrid, pop top, touring, luxury models with size, weight & sleeping capacity.",
     // url: "https://www.caravansforsale.com.au",
     // siteName: "https://www.caravansforsale.com.au",
     // type: "product",
   },
   twitter: {
     card: "summary_large_image",
     title: "Motorhomes For Sale – Australia’s Marketplace for New & Used Caravans",
     description:
       "Browse new & used motorhomes for sale across Australia.",
   },
   alternates: {
     canonical: "https://www.caravansforsale.com.au",
   },
   verification: {
     google: "6tT6MT6AJgGromLaqvdnyyDQouJXq0VHS-7HC194xEo",
   },
 };

const Page = () => (
  <div>
    <Home />
  </div>
);

export default Page;
