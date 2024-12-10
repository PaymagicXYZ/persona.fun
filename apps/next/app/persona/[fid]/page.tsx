"use client";

import ActionComponent from "@/components/action";
import DexToolsChartView from "./components/DexToolsChartView";
import PostFeed from "@/components/post-feed";
import usePersona from "@/hooks/use-persona";
import TokenDetails from "./components/TokenDetails";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useBalance } from "@/hooks/use-balance";

type TabValue = "no-coiner" | "token-holders";

export default function Page({ params }: { params: { fid: string } }) {
  const fid = parseInt(params.fid);
  const persona = usePersona(fid);
  const { data, isLoading } = useBalance(persona?.token?.address);

  // Show loading state while initial data is being fetched

  if (!persona || isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-screen-lg mx-auto justify-center items-center">
        <LoadingView />
      </div>
    );
  }

  const BALANCE = data ? data / BigInt(10 ** 18) : BigInt(0);
  const FARCASTER_POST =
    BigInt(persona?.token?.post_amount ?? 0) / BigInt(10 ** 18);
  const hasEnoughTokens = BALANCE >= FARCASTER_POST;

  return (
    <div className="flex flex-col gap-8 max-w-screen-lg mx-auto justify-center items-center">
      <TokenDetailsTabs
        fid={fid}
        initialTab={hasEnoughTokens ? "token-holders" : "no-coiner"}
      />
    </div>
  );
}

function TokenDetailsTabs({
  fid,
  initialTab,
}: {
  fid: number;
  initialTab: TabValue;
}) {
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  const handleValueChange = (value: string) => {
    setActiveTab(value as TabValue);
  };

  return (
    <Tabs
      className="w-full"
      value={activeTab}
      onValueChange={handleValueChange}
      defaultValue={initialTab}
    >
      <div className="flex justify-center">
        <TabsList className="h-[67px] px-2 bg-[#121212] mb-6">
          <TabsTrigger
            className="h-[57px] data-[state=active]:bg-[#1a1a1a]"
            value="no-coiner"
          >
            <Image
              src="/table.svg"
              alt="No Coiner View"
              width={45}
              height={49}
              className="mr-1"
            />
            <Label className="leading-7 font-bold text-2xl text-gray-100 cursor-pointer">
              No Coiner
            </Label>
          </TabsTrigger>
          <TabsTrigger
            className="h-[57px] data-[state=active]:bg-[#1a1a1a]"
            value="token-holders"
          >
            <Image
              src="/profits.svg"
              alt="Token Holders View"
              width={35}
              height={43}
              className="mr-1"
            />
            <Label className="leading-7 font-bold text-2xl text-gray-100 cursor-pointer">
              Token Holders
            </Label>
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="no-coiner">
        <NoCoinerView fid={fid} />
      </TabsContent>
      <TabsContent value="token-holders">
        <TokenHoldersView fid={fid} />
      </TabsContent>
    </Tabs>
  );
}

function LoadingView() {
  return (
    <div className="w-full">
      <div className="flex justify-center mb-6">
        <div className="h-[67px] px-2 bg-[#121212] flex gap-2">
          <Skeleton className="h-[57px] w-[180px]" />
          <Skeleton className="h-[57px] w-[180px]" />
        </div>
      </div>
      <div className="space-y-6 max-w-screen-sm mx-auto">
        <SkeletonPost />
        <SkeletonPost />
        <SkeletonPost />
      </div>
    </div>
  );
}

function SkeletonPost() {
  return (
    <div className="relative [overflow-wrap:anywhere] bg-[#111111] rounded-xl overflow-hidden">
      <div className="flex flex-col gap-4 border p-4 sm:p-6 rounded-xl">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  );
}

function NoCoinerView({ fid }: { fid: number }) {
  return (
    <div className="space-y-6">
      <TokenDetails fid={fid} />
      <DexToolsChartView fid={fid} />
    </div>
  );
}

function TokenHoldersView({ fid }: { fid: number }) {
  return (
    <div className="max-w-screen-sm mx-auto">
      <ActionComponent />
      <PostFeed fid={fid} />
    </div>
  );
}
