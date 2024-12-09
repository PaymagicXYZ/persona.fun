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
        tvl: 0,
        volumeDay: 0,
        pairCount: 0,
        priceUsd: parseFloat(pair.priceUsd) || 0,
      };
    }

    const token = tokenData[tokenAddress];
    token.pairCount++;

    if (
      tokenAddress.toLowerCase() ===
      "0x4ed4e862860bed51a9570b96d89af5e1b0efefed"
    ) {
      console.log(token, pair);
    }

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
    token.tvl += pair.liquidity.usd || 0;

    // Sum up 24h volume from all pairs
    token.volumeDay += pair.volume.h24 || 0;
  });

  // Format numbers
  Object.keys(tokenData).forEach((address) => {
    const token = tokenData[address];
    token.marketCap = parseFloat(token.marketCap.toFixed(2));
    token.priceChangeDay = parseFloat(token.priceChangeDay.toFixed(2));
    token.tvl = parseFloat(token.tvl.toFixed(2));
    token.volumeDay = parseFloat(token.volumeDay.toFixed(2));
  });

  return tokenData;
}

export function formatNumber(num: number): string {
  // For millions
  if (num >= 1_000_000) {
    // Remove any trailing .0
    const rounded = (num / 1_000_000).toFixed(1).replace(".0", "");
    return `${rounded}m`;
  }
  // For numbers less than a million, add commas with no decimals
  return Math.round(num).toLocaleString();
}
