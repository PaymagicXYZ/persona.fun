"use client";

import ActionComponent from "@/components/action";
import Characters from "@/components/characters";
import PostFeed from "@/components/post-feed";
import { ANON_ADDRESS } from "@anon/utils/src/config";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <ActionComponent tokenAddress={ANON_ADDRESS} />
      <Characters />
      <PostFeed tokenAddress={ANON_ADDRESS} />
    </div>
  );
}
