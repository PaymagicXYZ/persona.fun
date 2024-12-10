// import { getUserFromLS } from "../localStorage";
// import { ChatMessage } from "../types";
// import type { Persona } from "../types/persona";
// import { ApiClient } from "./client";

// const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "");

// export const chatApi = {
//   sendMessage: async ({
//     message,
//     personaId,
//   }: {
//     message: string;
//     personaId: number;
//   }) => {
//     const user = getUserFromLS();

//     if (!user) {
//       return;
//     }

//     const response = await apiClient.request<ChatMessage>(
//       `/chat/${personaId}`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//         },
//         body: JSON.stringify({
//           message,
//           pfp_url: user.pfp_url,
//           display_name: user.display_name,
//           background_gradient: user.background_gradient,
//         }),
//       }
//     );
//     return response.data;
//   },
//   getMessages: async ({ personaId }: { personaId: number }) => {
//     const response = await apiClient.request<ChatMessage[]>(
//       `/chat/${personaId}`,
//       {
//         method: "GET",
//       }
//     );
//     return response.data;
//   },
// };
