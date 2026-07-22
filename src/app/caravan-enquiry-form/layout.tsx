 import { Metadata } from "next";
import { ReactNode } from "react";



 export const metadata: Metadata = {
   title: {
     default: "Caravan Enquiry Form | Exclusive Caravan Deals & Offers",
     template: "%s ",
   },
   description:
     "Fill out our  motorhomeenquiry form to receive exclusive offers from select quality  motorhomemanufacturers. Get the best  motorhomedeals sent directly to you.",
   icons: { icon: "/favicon.ico" },
   robots: "index, follow",
   verification: {
     google: "6tT6MT6AJgGromLaqvdnyyDQouJXq0VHS-7HC194xEo", // ✅ this auto generates <meta name="google-site-verification" />
   },
   alternates: {
    canonical: "https://www.caravansforsale.com.au/caravan-enquiry-form/",
   },
   
 
 };
 
   export default function Layout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
  }
