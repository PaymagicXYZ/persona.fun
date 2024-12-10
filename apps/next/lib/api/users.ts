// import type { Persona } from "../types/persona";
// import { UserResponse } from "../types/users";
// import { ApiClient } from "./client";

// const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "");

// export const usersApi = {
//   register: async (display_name: string) => {
//     const verificationToken = localStorage.getItem("verificationToken");
//     if (!verificationToken) {
//       throw new Error("No verification token found");
//     }

//     const response = await apiClient.request<UserResponse>("/users", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${verificationToken}`,
//       },
//       body: JSON.stringify({ display_name }),
//     });

//     localStorage.removeItem("verificationToken");
//     return response.data;
//   },
//   verify: async (signature: string, raw_message: { message: string }) => {
//     const response = await apiClient.request<UserResponse>("/users/verify", {
//       method: "POST",
//       body: JSON.stringify({ signature, raw_message }),
//     });

//     if (response.data?.verificationToken) {
//       localStorage.setItem(
//         "verificationToken",
//         response.data.verificationToken
//       );
//     }

//     return response.data;
//   },
//   get: async (display_name: string) => {
//     const response = await apiClient.request<UserResponse>(
//       `/users/${display_name}`
//     );
//     return response.data;
//   },
//   getByAddress: async (address: string) => {
//     const response = await apiClient.request<UserResponse>(
//       `/users/address/${address}`
//     );
//     return response.data;
//   },
// };
