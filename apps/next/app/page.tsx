"use client";

import Banner from "@/components/banner";
import TradingView from "@/components/dextools-chart-view";
import Personas from "@/components/personas";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      {/* <TradingView /> */}

      <Banner />
      <Personas />

      {/* <ActionComponent /> */}
      {/* <PostFeed tokenAddress={ANON_ADDRESS} /> */}
    </div>
  );
}
