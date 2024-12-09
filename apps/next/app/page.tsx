"use client";

import Banner from "@/components/banner";
import Personas from "@/components/personas";
import TradingView from "@/components/trading-view";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <TradingView />
      {/*<Banner />
      <Personas /> */}

      {/* <ActionComponent /> */}
      {/* <PostFeed tokenAddress={ANON_ADDRESS} /> */}
    </div>
  );
}
