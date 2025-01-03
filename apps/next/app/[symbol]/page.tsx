"use client";

import ActionComponent from "@/components/action";
import PostFeed from "@/components/post-feed";
import usePersona from "@/hooks/use-persona-by-fid";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useBalance } from "@/hooks/use-balance";
import TokenDetails from "./components/TokenDetails";
import DexToolsChartView from "./components/DexToolsChartView";
import useTokenBySymbol from "@/hooks/use-token-by-symbol";
import usePersonaByAddress from "@/hooks/use-persona-by-address";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConnectButton } from "@/components/connect-button";
import Link from "next/link";
import TippingRewardsChecker from "./components/TippingRewards";

type TabValue = "no-coiner" | "token-holders";

export default function Page({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol;
  const token = useTokenBySymbol(symbol);
  const persona = usePersonaByAddress(token?.id);
  const { data, isLoading } = useBalance(persona?.token?.address);
  const { isConnecting, address } = useAccount();
  const [toggleConnectDialog, setToggleConnectDialog] = useState(false);
  const [toggleBuyDialog, setToggleBuyDialog] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [symbol]);

  useEffect(() => {
    setToggleConnectDialog(!isConnecting && !address);
  }, [address, isConnecting]);

  useEffect(() => {
    if (address && !isLoading && data !== undefined) {
      const BALANCE = data ? data / BigInt(10 ** 18) : BigInt(0);
      const FARCASTER_POST =
        BigInt(persona?.token?.post_amount ?? 0) / BigInt(10 ** 18);
      const hasEnoughTokens = BALANCE >= FARCASTER_POST;

      setToggleBuyDialog(!hasEnoughTokens);
    } else {
      setToggleBuyDialog(false);
    }
  }, [address, isLoading, data, persona?.token?.post_amount]);

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
      <ConnectWalletDialog toggle={toggleConnectDialog} />
      <BuyTokensDialog
        toggle={toggleBuyDialog}
        symbol={token?.symbol}
        uniswap_url={token?.uniswap_url}
      />
      <TokenDetailsTabs
        fid={persona.fid}
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
              src="/no-coiner.svg"
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
      <TippingRewardsChecker />
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

function ConnectWalletDialog({ toggle }: { toggle: boolean }) {
  const [open, setOpen] = useState(toggle);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center" />
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="rounded-full bg-[#231f20] w-[286px] h-[286px] relative flex justify-center items-center overflow-hidden">
            <Image
              className="absolute bottom-[-10px]"
              src="/sad-logo.svg"
              alt="sad-logo"
              width={177}
              height={177}
            />
          </div>
          <Label className="text-gray-100 font-bold leading-8 text-xl">
            Your wallet is not connected
          </Label>
          <div onClick={() => setOpen(false)}>
            <ConnectButton />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BuyTokensDialog({
  toggle,
  symbol,
  uniswap_url,
}: {
  toggle: boolean;
  symbol?: string;
  uniswap_url?: string;
}) {
  const [open, setOpen] = useState(toggle);

  useEffect(() => {
    setOpen(toggle);
  }, [toggle]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle />
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="rounded-full bg-[#231f20] w-[286px] h-[286px] relative flex justify-center items-center overflow-hidden">
            <Image
              className="absolute bottom-[-10px]"
              src="/sad-logo.svg"
              alt="sad-logo"
              width={177}
              height={177}
            />
          </div>
          <Label className="text-gray-100 font-bold leading-8 text-xl">
            You don't have enough {symbol} tokens
          </Label>
          {uniswap_url && (
            <Link
              target="_blank"
              className="bg-[#C83FD3] hover:bg-[#C83FD3]/90 rounded-xl w-[165px] h-[48px] flex justify-center items-center"
              href={uniswap_url}
            >
              <Label className="text-white text-lg font-bold ">
                Buy tokens
              </Label>
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
