"use client";

import ActionComponent from "@/components/action";
import DexToolsChartView from "./components/DexToolsChartView";
import PostFeed from "@/components/post-feed";
import usePersona from "@/hooks/use-persona";
import { useTokenHolders } from "@/hooks/use-token-holders";
import { useTokensOnChainData } from "@/hooks/use-tokens-on-chain-data";
import TokenDetails from "./components/TokenDetails";

export default function Page({ params }: { params: { fid: string } }) {
  const fid = parseInt(params.fid);

  usePersona(fid);

  return (
    <div className="flex flex-col gap-8 max-w-screen-lg mx-auto">
      {/* <ActionComponent /> */}
      <TokenDetails fid={fid} />
      <DexToolsChartView fid={fid} />

      <div className="flex h-screen flex-col py-4 gap-8">
        <PostFeed fid={fid} />
      </div>
    </div>
  );
}
