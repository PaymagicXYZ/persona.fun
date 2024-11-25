import { ApiClient } from "./client";

const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "");

export const personas = {
  getPersonas: async () => {
    const response = await apiClient.request<
      {
        id: number;
        name: string;
        fid: string;
        image_url: string;
        token: {
          id: number;
          name: string;
          symbol: string;
          supply: number;
          min_token_amount: number;
        };
      }[]
    >("/personas");
    return response.data;
  },
};
