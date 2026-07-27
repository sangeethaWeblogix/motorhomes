import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Motorhome Sales Australia | New & Used Motorhomes for Sale",
  description: "Find the best motorhome sales across Australia. Browse thousands of new and used motorhomes from trusted dealers and private sellers. Compare prices, types, and locations to find your perfect motorhome.",
  robots: "index, follow",
  alternates: {
    canonical: "https://www.caravansforsale.com.au/caravan-sales/",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
