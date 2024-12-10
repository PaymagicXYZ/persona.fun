import type { Persona } from "../types/persona";
import { ApiClient } from "./client";

const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "");

export const waitlistApi = {
  addToWaitlist: async (email: string) => {
    const response = await apiClient.request<Persona[]>("/waitlist", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return response.data;
  },
};
