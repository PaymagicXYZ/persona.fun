import { TokenResponse } from "../types";
import type { Persona } from "../types/persona";
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
};
