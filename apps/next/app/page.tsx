"use client";

import Banner from "@/components/banner";

import Personas from "@/components/personas";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <Banner />
      <Personas />

      {/* <ActionComponent /> */}
      {/* <PostFeed tokenAddress={ANON_ADDRESS} /> */}
    </div>
  );
}
