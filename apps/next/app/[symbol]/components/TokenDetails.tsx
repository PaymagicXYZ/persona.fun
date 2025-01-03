import { useTokensOnChainData } from "@/hooks/use-tokens-on-chain-data";

import { useTokenHolders } from "@/hooks/use-token-holders";
import usePersonaByFid from "@/hooks/use-persona-by-fid";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Persona } from "@/lib/types/persona";
import { ProcessedTokensMap } from "@/lib/types/tokens";
import { formatNumber, mockedData } from "@/lib/utils";

export default function TokenDetails({ fid }: { fid: number }) {
  const persona = usePersonaByFid(fid);

  const tokenHoldersData = useTokenHolders({
    tokenAddresses: persona?.token?.address ? [persona?.token?.address] : [],
  });

  const tokenData = useTokensOnChainData({
    tokenAddresses: persona?.token?.address ? [persona?.token?.address] : [],
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
      <TokenDetailsFooter />
    </Card>
  );
}

function TokenDetailsHeader({ persona }: { persona: Persona }) {
  return (
    <div className="flex justify-between">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex">
          <Image
            src={persona.shape_image_url}
            alt="logo"
            width={66}
            height={66}
            className="rounded-md"
          />
          <Image
            src={persona.image_url}
            alt={persona?.name}
            width={66}
            height={66}
            className="object-cover rounded-full absolute left-14"
          />
        </div>
        <div className="flex flex-col ml-16 gap-2">
          <Label className="text-gray-100 leading-8 text-xl">
            {persona.name}
          </Label>
          <Label className="text-gray-400 leading-8 text-base">
            ${persona.token?.symbol}
          </Label>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {persona?.x_url && (
          <Link
            href={persona.x_url}
            target="_blank"
            className="flex items-center"
          >
            <div className="w-[30px] h-[30px] relative">
              <Image
                src="/x.svg"
                alt="View"
                fill
                className="object-contain"
                sizes="30px"
              />
            </div>
          </Link>
        )}
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
  const isPositive =
    (mockedData[tokenAddr.toLowerCase()].priceChangeDay as number) > 0;

  return (
    <div className="flex justify-between">
      <div className="flex flex-col gap-2">
        <Label className="text-gray-400 leading-snug text-xl font-medium">
          Market cap
        </Label>

        <Label className="text-white leading-8 text-2xl font-semibold">
          {/* {token?.marketCap ? formatNumber(token.marketCap) : "N/A"} */}
          {formatNumber(mockedData[tokenAddr.toLowerCase()].marketCap)}
        </Label>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-gray-400 leading-snug text-xl font-medium">
          Liquidity
        </Label>

        <Label className="text-white leading-8 text-2xl font-semibold">
          {/* {token?.liquidity ? formatNumber(token.liquidity) : "N/A"} */}
          {formatNumber(mockedData[tokenAddr.toLowerCase()].liquidity)}
        </Label>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-gray-400 leading-snug text-xl font-medium">
          1D Change
        </Label>

        <Label
          className={`text-white leading-8 text-2xl font-semibold ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {/* {token?.priceChangeDay
            ? (token.priceChangeDay as number).toFixed(2) + "%"
            : "N/A"} */}
          {mockedData[tokenAddr.toLowerCase()].priceChangeDay.toFixed(2) + "%"}
        </Label>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-gray-400 leading-snug text-xl font-medium">
          Holders
        </Label>

        <Label className="text-white leading-8 text-2xl font-semibold">
          {tokenHoldersData
            ? formatNumber(tokenHoldersData[tokenAddr.toLowerCase()])
            : "N/A"}
        </Label>
      </div>
    </div>
  );
}

function TokenDetailsFooter() {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-gray-500 leading-8 text-xl font-medium">
        Description
      </Label>
      <Label className="text-gray-500 leading-8 text-xl font-medium">
        The intern is always online. The intern monitors discussions of your
        project and chimes in to help, promote, or fight on your behalf. The
        intern tips its token to encourage discourse and attention on your
        project. Once you have enough tokens, you too can speak through the
        intern&apos;s voice and even adjust how they react. Have fun.
      </Label>
    </div>
  );
}
