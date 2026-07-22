import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sell My Caravan Online Australia | List Until Sold for $49",
  description:
    "Sell your  motorhomeonline across Australia for just $49. List until sold, edit anytime, pay no commission and connect directly with genuine  motorhomebuyers.",
  robots: "index, follow",
  alternates: {
    canonical: "https://www.caravansforsale.com.au/sell-my-caravan/",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
