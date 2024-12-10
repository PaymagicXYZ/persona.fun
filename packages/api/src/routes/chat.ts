// import { supabase } from "@persona/db";
// import { createElysia } from "../utils";
// import { t } from "elysia";
// import jwt from "@elysiajs/jwt";

// const jwtSecret = process.env.JWT_SECRET as string;

// if (!jwtSecret) {
//   throw new Error("JWT_SECRET is not set");
// }

// // Create a separate app for protected routes
// const protectedChat = createElysia()
//   .use(
//     jwt({
//       name: "jwt",
//       secret: jwtSecret,
//     })
//   )
//   .derive(async ({ jwt: jwtPlugin, headers }) => {
//     const authHeader = headers.authorization;

//     if (!authHeader?.startsWith("Bearer ")) {
//       throw new Error("Missing or invalid authorization header");
//     }

//     const token = authHeader.split(" ")[1];
//     const payload = await jwtPlugin.verify(token);

//     if (!payload) {
//       throw new Error("Invalid token");
//     }

//     return {
//       user: payload as {
//         id: number;
//         address: string;
//         displayName: string;
//         createdAt: string;
//       },
//     };
//   })
//   .post(
//     "/:persona_fid",
//     async ({ params, body, user }) => {
//       const { data: persona, error: personaError } = await supabase
//         .from("personas")
//         .select("id")
//         .eq("fid", params.persona_fid)
//         .limit(1)
//         .single();

//       if (personaError || !persona) {
//         throw new Error("Persona not found");
//       }

//       const { data, error } = await supabase
//         .from("chat")
//         .insert({
//           message: body.message,
//           user_id: user.id,
//           persona_fid: parseInt(params.persona_fid),
//           display_name: user.displayName,
//           pfp_url: body.pfp_url,
//           background_gradient: body.background_gradient,
//         })
//         .select("*")
//         .single();

//       if (error) {
//         console.error("Failed to insert chat message:", error);
//         throw new Error("Failed to save chat message");
//       }

//       return data;
//     },
//     {
//       params: t.Object({
//         persona_fid: t.String(),
//       }),
//       body: t.Object({
//         message: t.String(),
//         display_name: t.String(),
//         background_gradient: t.String(),
//         pfp_url: t.Optional(t.String()),
//       }),
//     }
//   );

// // Main chat routes combining protected and public endpoints
// export const chatRoutes = createElysia({ prefix: "/chat" })
//   .use(protectedChat)
//   .get(
//     "/:persona_fid",
//     async ({ params }) => {
//       const { data, error } = await supabase
//         .from("chat")
//         .select("*")
//         .eq("persona_fid", params.persona_fid)
//         .order("created_at", { ascending: true });

//       if (error) {
//         console.error("Failed to fetch chat messages:", error);
//         throw new Error("Failed to fetch chat messages");
//       }

//       return data;
//     },
//     {
//       params: t.Object({
//         persona_fid: t.String(),
//       }),
//     }
//   );
