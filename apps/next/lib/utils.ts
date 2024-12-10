import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PostCastResponse } from "./types";
import { ProcessedTokensMap, TokenDexScreenerResponse } from "./types/tokens";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateWarpcastUrl(createdCast: PostCastResponse) {
  return `https://warpcast.com/${
    createdCast.cast.author.username
  }/${createdCast.cast.hash.slice(0, 10)}`;
}

export function processTokenData(
  data: TokenDexScreenerResponse
): ProcessedTokensMap {
  const tokenData: ProcessedTokensMap = {};

  data.pairs.forEach((pair) => {
    const tokenAddress = pair.baseToken.address.toLowerCase();

    if (!tokenData[tokenAddress]) {
      tokenData[tokenAddress] = {
        address: tokenAddress,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        marketCap: 0,
        priceChangeDay: 0,
        liquidity: 0,
        volumeDay: 0,
        pairCount: 0,
        priceUsd: parseFloat(pair.priceUsd) || 0,
      };
    }

    const token = tokenData[tokenAddress];
    token.pairCount++;

    token.marketCap = pair.marketCap;

    // Calculate weighted price change based on liquidity
    const tokenPairs = data.pairs.filter(
      (p) => p.baseToken.address.toLowerCase() === tokenAddress
    );
    const totalLiquidity = tokenPairs.reduce(
      (sum, p) => sum + p.liquidity.usd,
      0
    );
    const liquidityWeight = pair.liquidity.usd / totalLiquidity;

    token.priceChangeDay += pair.priceChange.h24 * liquidityWeight || 0;

    // Sum up TVL (liquidity) from all pairs
    token.liquidity += pair.liquidity.usd || 0;

    // Sum up 24h volume from all pairs
    token.volumeDay += pair.volume.h24 || 0;
  });

  // Format numbers
  Object.keys(tokenData).forEach((address) => {
    const token = tokenData[address];
    token.marketCap = parseFloat(token.marketCap.toFixed(2));
    token.priceChangeDay = parseFloat(token.priceChangeDay.toFixed(2));
    token.liquidity = parseFloat(token.liquidity.toFixed(2));
    token.volumeDay = parseFloat(token.volumeDay.toFixed(2));
  });

  return tokenData;
}

export function formatNumber(num: number): string {
  const absNum = Math.abs(num);

  // For billions
  if (absNum >= 1_000_000_000) {
    const rounded = (num / 1_000_000_000).toFixed(1).replace(".0", "");
    return `${rounded}b`;
  }

  // For millions
  if (absNum >= 1_000_000) {
    const rounded = (num / 1_000_000).toFixed(1).replace(".0", "");
    return `${rounded}m`;
  }

  // For thousands
  if (absNum >= 1_000) {
    const rounded = (num / 1_000).toFixed(1).replace(".0", "");
    return `${rounded}k`;
  }

  // For numbers less than a thousand, add commas with no decimals
  return Math.round(num).toLocaleString();
}

export const REGISTER_TYPES = {
  Register: [{ name: "display_name", type: "string" }],
} as const;

export const REGISTER_DOMAIN = {
  name: "Interns.fun Register",
  version: "1",
} as const;

export const VERIFY_TYPES = {
  Verify: [{ name: "message", type: "string" }],
} as const;

export const VERIFY_DOMAIN = {
  name: "Interns.fun Verify",
  version: "1",
} as const;
