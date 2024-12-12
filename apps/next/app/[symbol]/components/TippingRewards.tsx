import { ConnectButton } from "@/components/connect-button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { tokensApi } from "@/lib/api/tokens";
import { ClipLoader } from "react-spinners";
import Link from "next/link";

export default function TippingRewardsChecker() {
  const { address } = useAccount();

  return (
    <Card className="flex flex-col items-center space-y-6 py-6 bg-[#121212] rounded-md">
      <Image
        src="/my-money.svg"
        alt="check-eligibility"
        width={104}
        height={142}
      />
      <Label className="font-bold text-2xl leading-normal">
        Check your tipping rewards
      </Label>
      {!address && <ConnectButton />}
      {address && <ClaimDialog address={address} />}
    </Card>
  );
}

function ClaimDialog({ address }: { address: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: eligibilityData } = useQuery({
    queryKey: ["eligibility", address],
    queryFn: () => tokensApi.checkEligibility({ userAddress: address }),
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="bg-[#C83FD3] hover:bg-[#C83FD3]/90 text-white text-xl font-bold rounded-xl w-[165px] h-[48px]">
        Check
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center" />
        </DialogHeader>
        {eligibilityData && (
          <ClaimContent
            address={address}
            setIsOpen={setIsOpen}
            eligibilityData={eligibilityData}
          />
        )}
        {!eligibilityData && <NoClaimContent setIsOpen={setIsOpen} />}
      </DialogContent>
    </Dialog>
  );
}

enum ClaimView {
  CLAIMING = "claiming",
  SUCCESS = "success",
  FAILED = "failed",
}

function ClaimContent({
  address,
  setIsOpen,
  eligibilityData,
}: {
  address: string;
  setIsOpen: (isOpen: boolean) => void;
  eligibilityData: {
    [key: string]: { amount: number; image_url: string; symbol: string };
  };
}) {
  const [claimView, setClaimView] = useState(ClaimView.CLAIMING);
  const [txHashes, setTxHashes] = useState<
    { tx_hash: string; address: string; amount: number }[]
  >([]);

  // Pre-fetch tokens data
  const { data: tokens } = useQuery({
    queryKey: ["tokens"],
    queryFn: () => tokensApi.getTokens(),
  });

  // Create token map once
  const tokenMap = useMemo(() => {
    if (!tokens) return new Map();

    return tokens.reduce((acc, token) => {
      acc.set(token.address, {
        imageUrl: token.image_url,
        symbol: token.symbol,
      });
      return acc;
    }, new Map<string, { imageUrl: string; symbol: string }>());
  }, [tokens]);

  // Wait for tokens data before showing success view
  if (claimView === ClaimView.SUCCESS && !tokens) {
    return (
      <div className="flex justify-center items-center w-full h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C83FD3]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {claimView === ClaimView.CLAIMING && (
        <TokensForClaiming
          address={address}
          setClaimView={setClaimView}
          eligibilityData={eligibilityData}
          setTxHashes={setTxHashes}
        />
      )}
      {claimView === ClaimView.SUCCESS && (
        <ClaimSuccessContent
          setIsOpen={setIsOpen}
          txHashes={txHashes}
          tokenMap={tokenMap}
        />
      )}
      {claimView === ClaimView.FAILED && (
        <ClaimFailedContent setIsOpen={setIsOpen} />
      )}
    </div>
  );
}

function NoClaimContent({
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <div className="flex flex-col items-center w-full gap-6">
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
        Nothing to claim
      </Label>
      <Label className="text-gray-100 font-bold leading-8 text-xl">
        Please keep interacting with the intern.
      </Label>
      <Button
        onClick={() => setIsOpen(false)}
        className="bg-[#C83FD3] hover:bg-[#C83FD3]/90 text-white text-xl font-bold rounded-xl w-[165px] h-[48px]"
      >
        Close
      </Button>
    </div>
  );
}

function TokensForClaiming({
  address,
  setClaimView,
  eligibilityData,
  setTxHashes,
}: {
  address: string;
  setClaimView: (claimView: ClaimView) => void;
  eligibilityData: {
    [key: string]: { amount: number; image_url: string; symbol: string };
  };
  setTxHashes: (
    txHashes: {
      tx_hash: string;
      address: string;
      amount: number;
    }[]
  ) => void;
}) {
  const { mutateAsync: claimRewardsAsync, isPending } = useMutation({
    mutationFn: () => tokensApi.claimTips({ userAddress: address }),
  });

  const claimRewards = async () => {
    const response = await claimRewardsAsync();

    if (!response) {
      return;
    }

    setTxHashes(
      response?.transactions.map((tx) => ({
        tx_hash: tx.hash,
        address: tx.token_address,
        amount: tx.amount,
      }))
    );

    const txHash = response?.transactions.find(
      (tx) => tx.status === "success"
    )?.hash;

    // If there is a success tx, set the tx hash and claim view to success
    if (txHash) {
      // setTxHash(txHash);
      setClaimView(ClaimView.SUCCESS);
      return;
    }

    setClaimView(ClaimView.FAILED);
  };

  return (
    <>
      <Label className="text-center text-2xl font-bold leading-normal">
        Time to Collect Your Tips! 💎
      </Label>
      <div className="rounded-full bg-[#231f20] my-2 w-[286px] h-[286px] relative flex justify-center items-center overflow-hidden">
        <Image
          className="absolute bottom-[-10px]"
          src="/xl-logo.svg"
          alt="xl-logo"
          width={210}
          height={210}
        />
      </div>
      <div className="w-full mt-8">
        {Object.entries(eligibilityData).map(
          ([tokenAddress, { amount, image_url, symbol }], idx) => (
            <div
              key={idx}
              className="flex items-center justify-between w-full mb-4"
            >
              <div className="flex items-center gap-2">
                <Image
                  src={image_url}
                  alt="token"
                  width={35}
                  height={35}
                  className="rounded-full"
                />
                <Label className="font-semibold text-xl leading-8">
                  ${symbol}
                </Label>
              </div>
              <Label className="font-semibold text-xl leading-8">
                {amount}
              </Label>
            </div>
          )
        )}
        <div className="mt-6 w-full flex justify-center">
          <Button
            disabled={isPending}
            onClick={claimRewards}
            className="bg-[#C83FD3] hover:bg-[#C83FD3]/90 w-[165px] h-[48px] disabled:opacity-50 disabled:cursor-default"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <ClipLoader color="#fff" size={20} />
                <Label className="text-white text-xl font-bold rounded-xl cursor-pointer">
                  Claiming...
                </Label>
              </div>
            ) : (
              <Label className="text-white text-xl font-bold rounded-xl cursor-pointer">
                Claim
              </Label>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

function ClaimSuccessContent({
  setIsOpen,
  txHashes,
  tokenMap,
}: {
  setIsOpen: (isOpen: boolean) => void;
  txHashes: { tx_hash: string; address: string; amount: number }[];
  tokenMap: Map<string, { imageUrl: string; symbol: string }>;
}) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="rounded-full bg-[#231f20] my-2 w-[226px] h-[226px] relative flex justify-center items-center overflow-hidden">
        <Image
          className="absolute bottom-[-10px]"
          src="/success-cone.svg"
          alt="success-cone"
          width={157}
          height={157}
        />
      </div>
      <Label className="text-center text-2xl font-bold leading-normal">
        Claim successful!
      </Label>
      <div className="mt-6 w-full flex flex-col gap-8 justify-center items-center">
        {txHashes.map((tx) => {
          const tokenData = tokenMap.get(tx.address);
          if (!tokenData?.imageUrl) return null;

          return (
            <div
              className="flex justify-between items-center gap-2 w-full"
              key={tx.tx_hash}
            >
              <div className="w-full items-center gap-2 flex">
                <Label className="text-gray-100 text-base font-semibold">
                  Claimed {tx.amount}
                </Label>
                <Image
                  src={tokenData.imageUrl}
                  alt="token"
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <Label className="text-gray-100 text-base font-semibold">
                  ${tokenData.symbol}
                </Label>
              </div>
              <Link
                href={`https://basescan.org/tx/${tx.tx_hash}`}
                target="_blank"
                className="bg-[#C83FD3] hover:bg-[#C83FD3]/90 p-2 text-base font-bold rounded-xl flex justify-center items-center"
              >
                <Label className="text-white text-base font-bold cursor-pointer">
                  Transaction
                </Label>
              </Link>
            </div>
          );
        })}
        <Button
          onClick={() => setIsOpen(false)}
          className="bg-[#C83FD3] hover:bg-[#C83FD3]/90 text-white text-xl font-bold rounded-xl w-[185px] h-[48px] mt-6"
        >
          Close
        </Button>
      </div>
    </div>
  );
}

function ClaimFailedContent({
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <div className="flex flex-col items-center w-full">
      <Image
        src="/error-icon.svg"
        alt="error-icon"
        width={157}
        height={157}
        className="my-2"
      />
      <Label className="text-center text-2xl font-bold leading-normal">
        Claim failed!
      </Label>
      <div className="mt-6 w-full flex justify-center">
        <Button
          onClick={() => setIsOpen(false)}
          className="bg-[#C83FD3] hover:bg-[#C83FD3]/90 text-white text-xl font-bold rounded-xl w-[165px] h-[48px] "
        >
          Close
        </Button>
      </div>
    </div>
  );
}
