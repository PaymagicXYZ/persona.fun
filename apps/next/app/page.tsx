"use client";

import ActionComponent from "@/components/action";
import PostFeed from "@/components/post-feed";
import { ANON_ADDRESS } from "@persona/utils/src/config";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <ActionComponent />
      <PostFeed tokenAddress={ANON_ADDRESS} />
    </div>
  );
}
