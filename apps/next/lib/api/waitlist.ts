import type { Persona } from "../types/persona";
import { ApiClient } from "./client";

const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "");

export const waitlistApi = {
  addToWaitlist: async (signature: string, raw_message: { email: string }) => {
    console.log("signature", signature);
    console.log("raw_message", raw_message);
    const response = await apiClient.request<Persona[]>("/waitlist", {
      method: "POST",
      body: JSON.stringify({ signature, raw_message }),
    });
    return response.data;
  },
};
