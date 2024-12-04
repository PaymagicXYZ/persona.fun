import type { Persona } from "../types/persona";
import { ApiClient } from "./client";

const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "");

export const personasApi = {
  getPersonas: async () => {
    const response = await apiClient.request<Persona[]>("/personas");
    return response.data;
  },
  getPersonaByFid: async (fid: number) => {
    const response = await apiClient.request<Persona>(`/personas/fid/${fid}`);
    return response.data;
  },
};
