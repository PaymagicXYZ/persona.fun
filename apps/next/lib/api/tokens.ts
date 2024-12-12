import {
  ProcessedTokenData,
  ProcessedTokensMap,
  TokenDexScreenerResponse,
  TokenResponse,
} from "../types/tokens";
import { processTokenData } from "../utils";
import { ApiClient } from "./client";

const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "");

export const tokensApi = {
  getTokens: async () => {
    const response = await apiClient.request<TokenResponse[]>("/tokens");

    return response.data;
  },
  getToken: async ({ tokenAddress }: { tokenAddress: string }) => {
    const response = await apiClient.request<TokenResponse>(
      `/tokens/${tokenAddress}`
    );

    return response.data;
  },
  getTokenDexScreenerData: async ({
    tokenAddresses,
  }: {
    tokenAddresses: string[];
  }): Promise<{ tokens: ProcessedTokensMap }> => {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddresses.join(
      ","
    )}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch token data");
    }

    const data: TokenDexScreenerResponse = await response.json();

    const processedData = processTokenData(data);

    return { tokens: processedData };
  },
  getTokenHolders: async ({ tokenAddresses }: { tokenAddresses: string[] }) => {
    const encodedAddresses = encodeURIComponent(tokenAddresses.join(","));
    const url = `/tokens/token-holders?tokenAddresses=${encodedAddresses}`;

    const response = await apiClient.request<{ [key: string]: number }>(url);

    return response.data;
  },
  getTokenBySymbol: async ({ symbol }: { symbol: string }) => {
    const response = await apiClient.request<TokenResponse>(
      `/tokens/symbol/${symbol}`
    );

    return response.data;
  },
  checkEligibility: async ({ userAddress }: { userAddress: string }) => {
    const response = await apiClient.request<{
      [key: string]: { amount: number; image_url: string; symbol: string };
    }>(`/tokens/eligibility/${userAddress}`);

    return response.data;
  },
  claimTips: async ({ userAddress }: { userAddress: string }) => {
    const response = await apiClient.request<{
      user_address: string;
      transactions: {
        token_address: string;
        amount: number;
        hash: string;
        status: "success" | "reverted";
      }[];
    }>(`/tokens/claim/${userAddress}`);

    return response.data;
  },
};
