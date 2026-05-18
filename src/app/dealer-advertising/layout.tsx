 import { Metadata } from "next";
import { ReactNode } from "react";



 export const metadata: Metadata = {
   title: {
     default: "Motorhome Dealer Advertising | Unlimited Listings $199/Month | MotorhomesForSale",
     template: "%s ",
   },
   description:
     "Advertise your motorhome dealership on MotorhomesForSale.com.au. Unlimited listings, zero lead fees, and reach high-intent motorhome buyers across Australia.",
   icons: { icon: "/favicon.ico" },
   robots: "index, follow",
   verification: {
       // google: "6tT6MT6AJgGromLaqvdnyyDQouJXq0VHS-7HC194xEo", // ✅ this auto generates <meta name="google-site-verification" />
   },
   alternates: {
    canonical: "https://www.motorhomesforsale.com.au/dealer-advertising/",
   },
   
 
 };
 
   export default function Layout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
  }
