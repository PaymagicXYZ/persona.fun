import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { CircleCheckIcon } from "lucide-react";
import { CircleXIcon } from "lucide-react";
import { CircleMinusIcon, ExternalLink } from "lucide-react";
import { CreatePost } from "../create-post";
import Personas from "../personas";

import { useCreatePost } from "../create-post/context";
import Link from "next/link";
import { generateWarpcastUrl } from "@/lib/utils";

export default function ActionComponent() {
  // const BALANCE = data ? data / BigInt(10 ** 18) : BigInt(0);
  // const FARCASTER_POST =
  //   BigInt(TOKEN_CONFIG[ANON_ADDRESS].postAmount) / BigInt(10 ** 18);
  // const TWITTER_PROMOTE =
  //   BigInt(TOKEN_CONFIG[ANON_ADDRESS].promoteAmount) / BigInt(10 ** 18);
  // const DELETE_POST =
  //   BigInt(TOKEN_CONFIG[ANON_ADDRESS].deleteAmount) / BigInt(10 ** 18);

  const { createdCast } = useCreatePost();

  return (
    <Alert className="flex flex-col gap-4 bg-zinc-900 border border-zinc-700 top-20">
      <AlertDescription>
        <p className="text-zinc-400">
          Posts are made anonymous using zk proofs. Due to the complex
          calculations required, it could take up to a few minutes. Do not post
          porn, doxes, shills, or threats. This is not about censorship
          resistance - it&apos;s about great anonymous posts.
        </p>
      </AlertDescription>
      {/* <AlertTitle className="font-semibold text-xl">
        Post anonymously to Farcaster and X/Twitter
      </AlertTitle>
      <AlertDescription>
        <p className="text-zinc-400">
          Posts are made anonymous using zk proofs. Due to the complex
          calculations required, it could take up to a few minutes. Do not post
          porn, doxes, shills, or threats. This is not about censorship
          resistance - it&apos;s about great anonymous posts.
        </p>
        <br />
        <p className="text-zinc-400 ">Holder requirements:</p>
        <ul className="flex flex-col gap-1 mt-3">
          <TokenRequirement
            tokenAmount={data}
            tokenNeeded={FARCASTER_POST}
            string="Post on Farcaster"
            isConnected={!!address && !isLoading}
          />
          <TokenRequirement
            tokenAmount={data}
            tokenNeeded={TWITTER_PROMOTE}
            string="Promote posts to X/Twitter"
            isConnected={!!address && !isLoading}
          />
          <TokenRequirement
            tokenAmount={data}
            tokenNeeded={DELETE_POST}
            string="Delete posts"
            isConnected={!!address && !isLoading}
          />
        </ul>
      </AlertDescription>
      <div className="flex flex-row gap-2 justify-between ">
        <div className="flex flex-row gap-4">
          <a
            href="https://x.com/anoncast_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm decoration-dotted underline font-medium"
          >
            <span className="hidden sm:inline">X/Twitter</span>
            <img
              src="/x.svg"
              alt="X/Twitter"
              className="w-4 h-4 sm:hidden invert"
            />
          </a>

          <a
            href="https://warpcast.com/anoncast"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm decoration-dotted underline font-medium"
          >
            <span className="hidden sm:inline">Farcaster</span>
            <img
              src="/farcaster.svg"
              alt="Farcaster"
              className="w-4 h-4 sm:hidden invert"
            />
          </a>
        </div>

        <div className="flex flex-row gap-4 justify-end">
          <a
            href="https://dexscreener.com/base/0xc4ecaf115cbce3985748c58dccfc4722fef8247c"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm decoration-dotted underline font-medium"
          >
            DEX Screener
          </a>
          <a
            href="https://app.uniswap.org/swap?outputCurrency=0x0Db510e79909666d6dEc7f5e49370838c16D950f&chain=base"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm decoration-dotted underline font-medium"
          >
            Uniswap
          </a>
          <a
            href="https://github.com/Slokh/anoncast"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm decoration-dotted underline font-medium"
          >
            Github
          </a>
        </div>
      </div> */}
      {/* {address && !isLoading ? (
        FARCASTER_POST > BALANCE ? (
          <a
            href={`https://app.uniswap.org/swap?outputCurrency=${tokenAddress}&chain=base`}
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
          
        )
      ) : (
        <></>
      )} */}

      <Personas />
      <CreatePost />
      {createdCast && (
        <SuccessCastLink castUrl={generateWarpcastUrl(createdCast)} />
      )}
    </Alert>
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
  tokenAmount,
  tokenNeeded,
  oldTokenNeeded,
  string,
  isConnected,
}: {
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
      <p>
        {oldTokenNeeded && (
          <>
            <span className="line-through text-zinc-500">{`${oldTokenNeeded.toLocaleString()}`}</span>
            <span>{"  "}</span>
          </>
        )}
        {`${tokenNeeded.toLocaleString()} $ANON: ${string}`}
      </p>
    </li>
  );
}
