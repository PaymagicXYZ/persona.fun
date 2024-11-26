import { Persona } from "../types/persona";
import { ApiClient } from "./client";

const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "");

export const tokenConfig = {
  getTokenConfig: async ({ tokenAddress }: { tokenAddress: string }) => {
    // TODO: Add type
    const response = await apiClient.request<any>(
      `/token-config/${tokenAddress}`
    );
    return response.data;
  },
};
