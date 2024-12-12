import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { CircleCheckIcon } from "lucide-react";
import { CircleXIcon } from "lucide-react";
import { CircleMinusIcon, ExternalLink } from "lucide-react";
import { CreatePost } from "../create-post";
import Personas from "../personas";

import { useCreatePost } from "../create-post/context";
import Link from "next/link";
import { generateWarpcastUrl } from "@/lib/utils";
import { useBalance } from "@/hooks/use-balance";
import { useAccount } from "wagmi";
import { Label } from "../ui/label";
import { Card } from "../ui/card";

export default function ActionComponent() {
  const { createdCast, persona } = useCreatePost();
  const { address } = useAccount();
  const { data, isLoading } = useBalance(persona?.token?.address);

  const BALANCE = data ? data / BigInt(10 ** 18) : BigInt(0);
  const FARCASTER_POST =
    BigInt(persona?.token?.post_amount ?? 0) / BigInt(10 ** 18);

  const TWITTER_PROMOTE =
    BigInt(persona?.token?.promote_amount ?? 0) / BigInt(10 ** 18);

  const DELETE_POST =
    BigInt(persona?.token?.delete_amount ?? 0) / BigInt(10 ** 18);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 bg-[#121212] border top-20 p-4 rounded-md">
        <div className="text-gray-100 font-bold text-2xl leading-8">
          Post anonymously as the intern
        </div>
        <div>
          <Label className="text-gray-500 leading-8 text-xl font-medium">
            The intern is always online. The intern monitors discussions of your
            project and chimes in to help, promote, or fight on your behalf. The
            intern tips its token to encourage discourse and attention on your
            project. Once you have enough tokens, you too can speak through the
            intern&apos;s voice and even adjust how they react. Have fun.
          </Label>
          <br />
          <br />
          <Label className="text-gray-500 leading-8 text-xl font-medium">
            Posts are made anonymous using zk proofs. Due to the complex
            calculations required, it could take up to a few minutes. Do not
            post porn, doxes, shills, or threats.
          </Label>
          <br />
          <br />

          <Label className="text-gray-500 leading-8 text-xl font-medium">
            Holder requirements:
          </Label>
          <ul className="flex flex-col gap-1 mt-3">
            <TokenRequirement
              tokenSymbol={persona?.token?.symbol}
              tokenAmount={data}
              tokenNeeded={FARCASTER_POST}
              string="Post on Farcaster"
              isConnected={!!address && !isLoading}
            />
            <TokenRequirement
              tokenSymbol={persona?.token?.symbol}
              tokenAmount={data}
              tokenNeeded={TWITTER_PROMOTE}
              string="Promote posts to X/Twitter"
              isConnected={!!address && !isLoading}
            />
            <TokenRequirement
              tokenSymbol={persona?.token?.symbol}
              tokenAmount={data}
              tokenNeeded={DELETE_POST}
              string="Delete posts"
              isConnected={!!address && !isLoading}
            />
            <TokenRequirement
              tokenSymbol={persona?.token?.symbol}
              tokenAmount={data}
              tokenNeeded={BigInt(5000000)}
              string="Edit character"
              isConnected={!!address && !isLoading}
            />
          </ul>
        </div>

        {address && !isLoading ? (
          FARCASTER_POST > BALANCE ? (
            <a
              href={`https://app.uniswap.org/swap?outputCurrency=${persona?.token?.address}&chain=base`}
              target="_blank"
              rel="noreferrer"
            >
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex flex-row items-center justify-between gap-2">
                <p className="font-bold">{`Not enough tokens to post. Buy ${
                  FARCASTER_POST - BALANCE
                } more.`}</p>
              </div>
            </a>
          ) : (
            <></>
          )
        ) : (
          <></>
        )}

        {createdCast && (
          <SuccessCastLink castUrl={generateWarpcastUrl(createdCast)} />
        )}
      </Card>
      <Card className="flex flex-col gap-4 bg-[#121212] border top-20 rounded-md">
        <CreatePost />
      </Card>
    </div>
  );
}

function SuccessCastLink({ castUrl }: { castUrl: string }) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 mt-6 rounded-lg bg-green-50 border border-green-200">
      <div className="text-green-600 text-center font-medium">
        🎉 Your cast has been successfully created!
      </div>
      <Link
        href={castUrl}
        target="_blank"
        className="group flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
      >
        View on Warpcast
        <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
      <span className="text-sm text-green-600/70">
        Click to see your post on Warpcast
      </span>
    </div>
  );
}

function TokenRequirement({
  tokenSymbol,
  tokenAmount,
  tokenNeeded,
  oldTokenNeeded,
  string,
  isConnected,
}: {
  tokenSymbol: string | undefined;
  tokenAmount: bigint | undefined;
  tokenNeeded: bigint;
  oldTokenNeeded?: bigint;
  string: string;
  isConnected: boolean;
}) {
  const tokenAmountInTokens = tokenAmount
    ? tokenAmount / BigInt(10 ** 18)
    : BigInt(0);

  return (
    <li className="flex flex-row items-center gap-2 font-medium text-xs sm:text-base">
      {isConnected ? (
        tokenAmountInTokens >= tokenNeeded ? (
          <CircleCheckIcon className="text-green-500 w-4 h-4" />
        ) : (
          <CircleXIcon className="text-red-500 w-4 h-4" />
        )
      ) : (
        <CircleMinusIcon className="text-gray-400 w-4 h-4" />
      )}
      <p className="text-gray-500">
        {oldTokenNeeded && (
          <>
            <span className="line-through text-zinc-500">{`${oldTokenNeeded.toLocaleString()}`}</span>
            <span>{"  "}</span>
          </>
        )}
        {`${tokenNeeded.toLocaleString()} ${tokenSymbol}: ${string}`}
      </p>
    </li>
  );
}
