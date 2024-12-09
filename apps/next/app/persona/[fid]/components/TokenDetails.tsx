import { useTokensOnChainData } from "@/hooks/use-tokens-on-chain-data";

import { useTokenHolders } from "@/hooks/use-token-holders";
import usePersona from "@/hooks/use-persona";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Persona } from "@/lib/types/persona";
import { ProcessedTokensMap } from "@/lib/types/tokens";
import { formatNumber } from "@/lib/utils";

export default function TokenDetails({ fid }: { fid: number }) {
  const persona = usePersona(fid);

  const tokenHoldersData = useTokenHolders({
    tokenAddresses: [persona?.token?.address!],
  });

  const tokenData = useTokensOnChainData({
    tokenAddresses: [persona?.token?.address!],
  });

  return (
    <Card className="bg-[#121212] p-6 rounded-md space-y-10">
      {persona && <TokenDetailsHeader persona={persona} />}
      {persona && (
        <TokenDetailsBody
          tokenAddr={persona.token?.address!}
          tokenData={tokenData?.tokens}
          tokenHoldersData={tokenHoldersData}
        />
      )}
    </Card>
  );
}

function TokenDetailsHeader({ persona }: { persona: Persona }) {
  return (
    <div className="flex justify-between">
      <div className="flex items-center justify-between gap-4">
        <Image
          src={persona.image_url}
          alt={persona?.name}
          width={76}
          height={76}
          className="object-cover rounded-md"
        />
        <div className="flex flex-col">
          <Label className="text-gray-100 leading-8 text-xl">
            {persona.name}
          </Label>
          <Label className="text-gray-400 leading-8 text-base">
            ${persona.token?.symbol}
          </Label>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Link
          href={persona.fc_url ?? ""}
          target="_blank"
          className="flex items-center"
        >
          <div className="w-[30px] h-[30px] relative">
            <Image
              src="/farcaster.svg"
              alt="View"
              fill
              className="object-contain"
              sizes="30px"
            />
          </div>
        </Link>
        <Link
          href={persona.token?.dex_screener_url ?? ""}
          target="_blank"
          className="flex items-center"
        >
          <div className="w-[30px] h-[30px] relative">
            <Image
              src="/dex-screener.svg"
              alt="View"
              fill
              className="object-contain"
              sizes="30px"
            />
          </div>
        </Link>
        <Link
          href={persona.token?.uniswap_url ?? ""}
          target="_blank"
          className="flex items-center"
        >
          <div className="w-[30px] h-[30px] relative">
            <Image
              src="/uniswap.svg"
              alt="View"
              fill
              className="object-contain"
              sizes="30px"
            />
          </div>
        </Link>
      </div>
    </div>
  );
}

function TokenDetailsBody({
  tokenAddr,
  tokenData,
  tokenHoldersData,
}: {
  tokenAddr: string;
  tokenData?: ProcessedTokensMap;
  tokenHoldersData?: { [key: string]: number };
}) {
  const token = tokenData?.[tokenAddr.toLowerCase()];

  return (
    <div className="flex justify-between">
      <div className="flex flex-col gap-2">
        <Label className="text-gray-400 leading-snug text-xl font-medium">
          Market cap
        </Label>
        {token && (
          <Label className="text-white leading-8 text-2xl font-semibold">
            {formatNumber(token.marketCap)}
          </Label>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-gray-400 leading-snug text-xl font-medium">
          Liquidity
        </Label>
        {token && (
          <Label className="text-white leading-8 text-2xl font-semibold">
            {formatNumber(token.liquidity)}
          </Label>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-gray-400 leading-snug text-xl font-medium">
          1D Change
        </Label>
        {token && (
          <Label className="text-white leading-8 text-2xl font-semibold">
            {formatNumber(token.priceChangeDay)}
          </Label>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-gray-400 leading-snug text-xl font-medium">
          Holders
        </Label>
        {tokenHoldersData && (
          <Label className="text-white leading-8 text-2xl font-semibold">
            {formatNumber(tokenHoldersData[tokenAddr.toLowerCase()])}
          </Label>
        )}
      </div>
    </div>
  );
}
