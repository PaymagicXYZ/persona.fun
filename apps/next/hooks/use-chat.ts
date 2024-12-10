// import { chatApi } from "@/lib/api/chat";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { useEffect } from "react";
// import { createClient } from "@supabase/supabase-js";

// if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
//   throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
// }

// if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
//   throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
// }

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// export default function useGetMessagesQuery({ fid }: { fid?: number }) {
//   const { data } = useQuery({
//     queryKey: ["chat", fid],
//     queryFn: () => chatApi.getMessages({ personaId: fid! }),
//     enabled: !!fid,
//   });

//   return { messages: data };
// }

// export function useChatSubscription({ fid }: { fid: number }) {
//   const queryClient = useQueryClient();

//   useEffect(() => {
//     const subscription = supabase
//       .channel("chat_channel")
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "chat",
//           filter: `persona_fid=eq.${fid}`,
//         },
//         (payload) => {
//           const newMessage = payload.new as any;

//           queryClient.setQueryData(
//             ["chat", fid],
//             (oldData: any[] | undefined) => {
//               if (!oldData) return [newMessage];

//               // Maintain ascending order (oldest to newest)
//               return [...oldData, newMessage].sort(
//                 (a, b) =>
//                   new Date(a.created_at).getTime() -
//                   new Date(b.created_at).getTime()
//               );
//             }
//           );
//         }
//       )
//       .subscribe();

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [queryClient, fid]);
// }
