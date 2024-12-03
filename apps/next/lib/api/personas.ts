import type { Persona } from "../types/persona";
import { ApiClient } from "./client";

const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "");

export const personas = {
  getPersonas: async () => {
    const response = await apiClient.request<Persona[]>("/personas");
    return response.data;
  },
};
