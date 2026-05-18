// src/app/components/SearchSection.tsx
"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import {
  fetchHomeSearchList,
  fetchKeywordSuggestions,
} from "@/api/homeSearch/api";
import "../app/home/main.css";
import { fetchSleepBands } from "@/api/homeApi/sleep/api";
import { fetchRegion } from "@/api/homeApi/region/api";
import { fetchManufactures } from "@/api/homeApi/manufacture/api";
import { fetchPriceBasedCaravans } from "@/api/homeApi/price/api";
import { fetchAtmBasedCaravans } from "@/api/homeApi/weight/api";
import { fetchLengthBasedCaravans } from "@/api/homeApi/length/api";
import { fetchUsedCaravansList } from "@/api/homeApi/usedCaravanList/api";
import { fetchStateBasedCaravans } from "@/api/homeApi/state/api";
import TabCardSkeleton from "./components/TabCardSkeleton";
import CaravansByStateSkeleton from "./components/Caravansbystateskeleton";
import SearchSuggestionSkeleton from "./components/Searchsuggestionskeleton ";
import { useBanners } from "@/components/BannerHandler";
import { useBannerTracking } from "@/hooks/useBannerTracking";
import PostRequirement from "./postRequirement";
import { fetchRequirements, Requirement } from "@/api/postRquirements/api";

interface TabsItem {
  label: string;
  capacity: number;
  slug: string;
  permalink: string;
  caravan_count: string;
  starting_price: number;
  display_text: string;
  state: string;
  short_label: string;
  short_count: string;
  region: string;
  make: string;
}

type TabCard = {
  title: string;
  sub: string;
  url: string;
};

type Item = {
  title?: string;
  name?: string;
  heading?: string;
  make?: string;
  url?: string;
  model?: string;
  variant?: string;
  slug?: string | number;
  id?: string | number;
  label?: string;
} & Record<string, unknown>;

type StateMeta = {
  [key: string]: {
    code: string;
    image: string;
  };
};

interface SearchSectionProps {
  requirements: Requirement[];
  sleepBands: TabsItem[];
  regionBands: TabsItem[];
  manufactureBands: TabsItem[];
  atmBands: TabsItem[];
  lengthBands: TabsItem[];
  priceBands: TabsItem[];
  usedData: {
    by_category: TabsItem[];
    by_state: TabsItem[];
    by_region: TabsItem[];
  };
  stateBands: TabsItem[];
}

export default function SearchSection({
  requirements = [],
  sleepBands = [],
  regionBands = [],
  manufactureBands = [],
  atmBands = [],
  lengthBands = [],
  priceBands = [],
  usedData = { by_category: [], by_state: [], by_region: [] },
  stateBands = [],
}: SearchSectionProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [navigating, setNavigating] = useState(false);

  const [isSuggestionBoxOpen, setIsSuggestionBoxOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [baseSuggestions, setBaseSuggestions] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [conditionValue, setConditionValue] = useState("");
  const stateBandsLoading = stateBands.length === 0;
  console.log("homestate", stateBands);
  const isSearchEnabled = category || location || conditionValue;
  const [activeIndex, setActiveIndex] = useState(0);

  const stateMeta: StateMeta = {
    victoria: { code: "VIC", image: "/images/vic_map.svg?=2" },
    "new-south-wales": { code: "NSW", image: "/images/nsw_map.svg?=2" },
    queensland: { code: "QLD", image: "/images/qld_map.svg?=2" },
    "south-australia": { code: "SA", image: "/images/sa_map.svg?=2" },
    "western-australia": { code: "WA", image: "/images/wa_map.svg?=2" },
    tasmania: { code: "TAS", image: "/images/tas_map.svg?=3" },
  };

  const [usedCategoryList, setUsedCategoryList] = useState<TabsItem[]>([]);
  const [usedState, setUsedState] = useState<TabsItem[]>([]);
  const [usedRegion, setUsedRegion] = useState<TabsItem[]>([]);

  const tabsData: {
    key: string;
    label: string;
    cards: TabCard[];
  }[] = [
    {
      key: "Region",
      label: "Location",
      cards: regionBands.map((item) => ({
        title: "Motorhomes for Sale in " + item.region,
        sub: `${item.caravan_count ?? 0}`,
        url: `/listings/${item.permalink}`,
      })),
    },
    {
      key: "price",
      label: "Price",
      cards: priceBands.map((item) => ({
        title: "Motorhomes for Sale " + item.short_label,
        sub: `${item.caravan_count ?? 0}`,
        url: `/listings/${item.permalink}`,
      })),
    },
    {
      key: "GVM",
      label: "GVM",
      cards: atmBands.map((item) => ({
        title: "Motorhomes for Sale " + item.short_label,
        sub: `${item.caravan_count ?? 0}`,
        url: `/listings/${item.permalink}`,
      })),
    },
    {
      key: "Sleep",
      label: "Sleep",
      cards: sleepBands.map((item) => ({
        title: "Motorhomes for Sale " + item.short_label,
        sub: `${item.caravan_count ?? 0}`,
        url: `/listings/${item.permalink}`,
      })),
    },
    {
      key: "Length",
      label: "Length",
      cards: lengthBands.map((item) => ({
        title: "Motorhomes for Sale " + item.short_label,
        sub: `${item.caravan_count ?? 0}`,
        url: `/listings/${item.permalink}`,
      })),
    },
    {
      key: "Manufacturer",
      label: "Manufacturer",
      cards: manufactureBands.map((item) => ({
        title: item.make + " Motorhomes for Sale",
        sub: `${item.caravan_count ?? 0}`,
        url: `/listings/${item.permalink}`,
      })),
    },
  ];

  const [activeTab, setActiveTab] = useState(tabsData[0].key);
  const currentTab = tabsData.find((t) => t.key === activeTab);

  const flips = [
    {
      type: "Off Road",
      budget: "$90,000",
      msg: "Queen, ensuite, ample power, ample water and grey water, 19 foot, rear door, 600 kg plus payload, tare <2800, atm 3500",
    },
    {
      type: "Off Road",
      budget: "$85,000",
      msg: "Couples van, approx 19ft tandem axel, tare approx 2200kg. Atm up to 3300kg. Full time touring, off grid essentials.",
    },
    {
      type: "Hybrid",
      budget: "$50,000",
      msg: "Island Bed, Compressor fridge, ensuite, Hot Water heater, Solar, 2 x freshwater tanks, 1 x grey, awning.",
    },
    {
      type: "Family",
      budget: "$75,000",
      msg: "Tare weight 2200 or less, bunks, semi off road, off grid. Max solar, 3000w inverter, lithium batteries.",
    },
    {
      type: "Luxury",
      budget: "$100,000",
      msg: "Slide out van under 3500kg. Suitable for Ford Ranger Next Gen. 2–3 beds preferred.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % flips.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      import("bootstrap/dist/js/bootstrap.bundle.min.js");
    }
  }, []);

  const handleSearch = () => {
    if (!category && !location && !conditionValue) {
      alert("Select at least one filter");
      return;
    }
    setNavigating(true);
    if (conditionValue === "All") {
      router.push("/listings");
      return;
    }
    const parts: string[] = [];

    if (conditionValue && conditionValue !== "All") {
      const conditionSlug =
        conditionValue.toLowerCase().replace(/\s+/g, "-") + "-condition";
      parts.push(conditionSlug);
    }
    if (category) {
      const catSlug =
        category.toLowerCase().replace(/\s+/g, "-") + "-category";
      parts.push(catSlug);
    }
    if (location) {
      const stateSlug =
        location.toLowerCase().replace(/\s+/g, "-") + "-state";
      parts.push(stateSlug);
    }

    const finalUrl = `/listings/${parts.join("/")}`;
    router.push(finalUrl);
  };

  const navigateBySelect = (value: string, suffix: string) => {
    if (!value) return;
    setNavigating(true);
    const slug = value.toLowerCase().replace(/\s+/g, "-") + suffix;
    setTimeout(() => {
      router.push(`/listings/${slug}`, { scroll: true });
    }, 50);
  };

  console.log("navigating ", navigateBySelect);

  const loadBaseOnce = async () => {
    if (baseSuggestions.length) {
      setSuggestions(baseSuggestions);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await fetchHomeSearchList();

      const labels: Item[] = data.map((x) => ({
        id: x.id,
        label: (x.name ?? "").toString().trim(),
        url: (x.url ?? "").toString(),
      }));

      setBaseSuggestions(labels);
      setSuggestions(labels);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const showSuggestions = async () => {
    setIsSuggestionBoxOpen(true);
    if (!query.trim()) {
      await loadBaseOnce();
    }
  };

  const closeSuggestions = () => setIsSuggestionBoxOpen(false);
  const isTabsLoading = tabsData.every((t) => t.cards.length === 0);

  useEffect(() => {
    const controller = new AbortController();

    if (query.length >= 3) {
      setLoading(true);
      setError("");
      const t = setTimeout(async () => {
        try {
          const list = await fetchKeywordSuggestions(query, controller.signal);
          const uniq: Item[] = Array.from(
            new Map(
              list.map((x, idx: number) => [
                (x.keyword || "").toString().trim(),
                {
                  id: x.id ?? idx,
                  label: (x.keyword || "").toString().trim(),
                  url: (x.url || "").toString(),
                },
              ]),
            ).values(),
          );

          setSuggestions(uniq);
        } catch (e: unknown) {
          if (e instanceof DOMException && e.name === "AbortError") return;
          setError(e instanceof Error ? e.message : "Failed");
        } finally {
          setLoading(false);
        }
      }, 300);

      return () => {
        controller.abort();
        clearTimeout(t);
      };
    } else {
      setSuggestions(baseSuggestions);
      setLoading(false);
      return () => controller.abort();
    }
  }, [query, baseSuggestions]);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    e,
  ) => {
    setQuery(e.target.value);
    if (!isSuggestionBoxOpen) setIsSuggestionBoxOpen(true);
  };

  const navigateWithKeyword = (s: Item) => {
    const human = s.label?.trim();
    if (!human) return;

    flushSync(() => {
      setQuery(human);
      setNavigating(true);
    });
    setIsSuggestionBoxOpen(false);

    setTimeout(() => {
      if (s.url && s.url.trim().length > 0) {
        router.push(s.url, { scroll: true });
      } else {
        const slug = human
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        router.push(`/listings/${slug}-search`, { scroll: true });
      }
    }, 50);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      const kw = (e.currentTarget as HTMLInputElement).value.trim();
      if (kw) {
        setNavigating(true);
        navigateWithKeyword({ label: kw });
      }
    }
    if (e.key === "Escape") closeSuggestions();
  };

  const showingFromKeywordApi = query.length >= 3;

  const { matchedBanners, isMobile } = useBanners();
  const { bannerRefs, trackClick } = useBannerTracking(matchedBanners);

  return (
    <div>
      <div className="ad_banner">
        <a href="https://www.caravansforsale.com.au/listings/">
          <div className="item-image">
            <Image
              src="/images/banner_top_dk.jpg?=4"
              className="hidden-xs"
              alt="off-road"
              width={2000}
              height={700}
              style={{ width: "100%", height: "auto" }}
              unoptimized
            />
            <Image
              src="/images/banner_top_mb.jpg?=2"
              className="hidden-lg hidden-md hidden-sm"
              alt="off-road"
              width={2000}
              height={700}
              style={{ width: "100%", height: "auto" }}
              unoptimized
            />
          </div>
        </a>
      </div>

      {/* FIX: explore-boxes is now inside the container div */}
      <div className="search_requirement_area">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-12">
              <div className="section-head search_home text-center">
                {/* FIX: "Motohomes" → "Motorhomes" */}
                <h1 className="divide-orange">
                  Browse New &amp; Used Motorhomes For Sale
                </h1>
                <p>
                  Find your ideal motorhome from thousands of new and used
                  listings across Australia's top brands, dealers, and private
                  sellers. Search by type, condition, location, and budget.
                </p>
              </div>
            </div>
          </div>

          <div className="explore-boxes">
            {/* Box 1 */}
            <div className="explore-box active">
              {/* FIX: "Motohome" → "Motorhome" */}
              <h3>See New Motorhome Listings</h3>
              <p>
                Browse the latest new motorhomes from top dealerships in
                Australia.
              </p>
              <a href="/listings/new-condition/" className="btn btn-primary">
                Browse New Listings
              </a>
              <div className="illustration left" />
            </div>

            {/* Box 2 */}
            <div className="explore-box">
              <h3>Used Motorhomes For Sale</h3>
              {/* FIX: removed extra space before "by" */}
              <p>
                Find great deals on quality used motorhomes for sale by dealers
                and private sellers.
              </p>
              <a href="/listings/used-condition/" className="btn btn-primary">
                Search Used Listings
              </a>
              <div className="illustration center" />
            </div>

            {/* Box 3 */}
            <div className="explore-box">
              {/* FIX: "Motohomes" → "Motorhomes" */}
              <h3>See All Motorhomes</h3>
              <p>
                Explore the full range of new and used motorhomes across
                Australia.
              </p>
              <a href="/listings/" className="btn btn-primary">
                Start Searching
              </a>
              <div className="illustration right" />
            </div>
          </div>
        </div>
      </div>

      <section className="caravans_by_state related-products services section-padding pt-2 style-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="sell-banner">
                {/* LEFT CONTENT */}
                {/* FIX: "Campervan" → "Motorhome" throughout this section */}
                <div className="sell-content">
                  <h3>List Your Motorhome For Sale Today</h3>

                  <p className="subtitle">
                    Reach thousands of motorhome buyers daily.
                  </p>

                  <p className="desc">
                    List your motorhome on MotorhomesForSale.com.au —
                    Australia's trusted marketplace to buy and sell motorhomes.
                  </p>

                  <div className="btns_two">
                    <a href="/dealer-advertising/" className="btn primary-btn">
                      Dealer Sign Up
                    </a>

                    <a href="/sell-my-motorhome/" className="btn secondary-btn">
                      Private Seller - Click Here
                    </a>
                  </div>
                </div>
              </div>

              <PostRequirement requirements={requirements ?? []} />
            </div>
          </div>
        </div>
      </section>

      {/* Motorhomes by State Section */}
      <div className="caravans_by_state related-products services section-padding style-1 pt-0">
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="section-head mb-2 py-2">
                {/* FIX: "for salein" → "for sale in" (missing space) */}
                <h2>Browse Motorhomes for Sale in Australia by State</h2>
              </div>
            </div>
          </div>
          {stateBandsLoading ? (
            <CaravansByStateSkeleton count={4} />
          ) : (
            <div className="content">
              <div className="explore-state position-relative">
                <Swiper
                  modules={[Navigation]}
                  navigation={{
                    nextEl: ".state-manu-next",
                    prevEl: ".state-manu-prev",
                  }}
                  spaceBetween={20}
                  slidesPerView={1}
                  breakpoints={{
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 4 },
                    1280: { slidesPerView: 4 },
                  }}
                >
                  {stateBands.map((item, index) => {
                    const key = item.state
                      .toLowerCase()
                      .replace(/\s+/g, "-");

                    const meta = stateMeta[key] || {};
                    const stateCode = meta.code || "";
                    const mapImage = meta.image || "";

                    return (
                      <SwiperSlide key={index}>
                        <div className="service-box">
                          <div className="sec_right">
                            <span>
                              <Image
                                src={mapImage}
                                alt={`${item.state} map`}
                                width={100}
                                height={100}
                              />
                            </span>
                          </div>
                          <div className="sec_left">
                            <h3>{item.state}</h3>
                            <div className="info">
                              <div className="quick_linkss">
                                <p>{item.display_text}</p>
                                <a
                                  className="view_all"
                                  href={`/listings${item.permalink}`}
                                >
                                  View All Motorhomes for Sale in {stateCode}{" "}
                                  <i className="bi bi-chevron-right"></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>

                {/* Arrows */}
                <div className="swiper-button-next state-manu-next" />
                <div className="swiper-button-prev state-manu-prev" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="quick_links_tabs pb-5">
        <div className="container">
          <div className="section-head mb-2 py-2">
            {/* FIX: "Motohome" → "Motorhome" */}
            <h2>Popular Motorhome Searches Across Australia</h2>
          </div>
          <div className="custom-tabs-wrap">
            {/* Tabs */}
            <div className="custom-tabs-top">
              <div className="custom-tabs-nav">
                {tabsData.map((tab) => (
                  <button
                    key={tab.key}
                    className={`custom-tab-btn ${
                      activeTab === tab.key ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                    type="button"
                  >
                    {tab.label}
                    {tab.label === "More" && (
                      <span className="tab-arrow">⌄</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards - All tabs rendered in DOM, only active visible (SEO-friendly) */}
            <div className="custom-tabs-content">
              {tabsData.map((tab) => (
                <div
                  key={tab.key}
                  className="custom-card-grid"
                  style={{ display: activeTab === tab.key ? "grid" : "none" }}
                >
                  {isTabsLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <TabCardSkeleton key={i} />
                      ))
                    : tab.cards?.map((item, index) => (
                        <a
                          href={item.url}
                          className="custom-card"
                          key={index}
                        >
                          <h4 className="custom-card-title">
                            <span className="count">{item.sub}</span>{" "}
                            {item.title}
                          </h4>
                        </a>
                      ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {navigating && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 9999,
          }}
          aria-live="polite"
        >
          <div className="text-center">
            <Image
              className="loader_image"
              src="/images/loader.gif"
              alt="Loading..."
              width={80}
              height={80}
              unoptimized
            />{" "}
            <div className="mt-2 fw-semibold">Loading…</div>
          </div>
        </div>
      )}
    </div>
  );
}