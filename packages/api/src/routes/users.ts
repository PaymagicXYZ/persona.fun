// import { supabase } from "@persona/db";
// import { createElysia, generateRandomGradient } from "../utils";
// import { t } from "elysia";
// import { recoverTypedDataAddress } from "viem";
// import jwt from "@elysiajs/jwt";

// const VERIFY_DOMAIN = {
//   name: "Interns.fun Verify",
//   version: "1",
// } as const;

// const VERIFY_TYPES = {
//   Verify: [{ name: "message", type: "string" }],
// } as const;

// const jwtSecret = process.env.JWT_SECRET as string;

// if (!jwtSecret) {
//   throw new Error("JWT_SECRET is not set");
// }

// export const usersRoutes = createElysia({ prefix: "/users" })
//   .use(
//     jwt({
//       name: "jwt",
//       secret: jwtSecret,
//     })
//   )
//   // Registration endpoint
//   .post(
//     "/",
//     async ({ body, jwt, headers }) => {
//       const { display_name } = body;
//       const authHeader = headers.authorization;

//       if (!authHeader?.startsWith("Bearer ")) {
//         throw new Error("No verification token provided");
//       }

//       const token = authHeader.split(" ")[1];
//       const verified = await jwt.verify(token);

//       if (!verified || !verified.address) {
//         throw new Error("Invalid or expired verification token");
//       }

//       const address = verified.address as string;

//       console.log("address", address);
//       console.log("body", body);

//       // Create new user
//       const { data: userData, error: userError } = await supabase
//         .from("users")
//         .insert({
//           display_name,
//           background_gradient: generateRandomGradient(),
//           address,
//         })
//         .select("*")
//         .limit(1)
//         .single();

//       if (userError) {
//         throw new Error("Failed to create user");
//       }

//       // Generate session JWT for new user
//       const sessionToken = await jwt.sign({
//         id: userData.id,
//         address: userData.address,
//         displayName: userData.display_name,
//         createdAt: userData.created_at,
//         background_gradient: userData.background_gradient,
//       });

//       return {
//         ...userData,
//         token: sessionToken,
//         is_existing: false,
//       };
//     },
//     {
//       body: t.Object({
//         display_name: t.String(),
//       }),
//     }
//   )
//   // Verification endpoint
//   .post(
//     "/verify",
//     async ({ body, jwt }) => {
//       const { signature, raw_message } = body;

//       // Recover address from verification signature
//       const address = await recoverTypedDataAddress({
//         domain: VERIFY_DOMAIN,
//         types: VERIFY_TYPES,
//         primaryType: "Verify",
//         message: raw_message,
//         signature: signature as `0x${string}`,
//       });

//       // Generate temporary JWT with verified address
//       const verificationToken = await jwt.sign({
//         address,
//         purpose: "registration",
//         exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes expiry
//       });

//       // Check if user exists
//       const { data: userData, error } = await supabase
//         .from("users")
//         .select("*")
//         .eq("address", address)
//         .limit(1)
//         .maybeSingle();

//       if (error) {
//         throw new Error("Failed to get user");
//       }

//       if (!userData) {
//         return {
//           verificationToken,
//         };
//       }

//       // Generate session JWT for existing user
//       const sessionToken = await jwt.sign({
//         id: userData.id,
//         address: userData.address,
//         displayName: userData.display_name,
//         createdAt: userData.created_at,
//         background_gradient: userData.background_gradient,
//       });

//       return {
//         ...userData,
//         token: sessionToken,
//         is_existing: true,
//       };
//     },
//     {
//       body: t.Object({
//         signature: t.String(),
//         raw_message: t.Object({
//           message: t.String(),
//         }),
//       }),
//     }
//   )

//   // Username availability check
//   .get(
//     "/:display_name",
//     async ({ params }) => {
//       const { data, error } = await supabase
//         .from("users")
//         .select("id")
//         .eq("display_name", params.display_name)
//         .limit(1)
//         .maybeSingle();

//       if (error) {
//         throw new Error("Failed to get user");
//       }

//       return {
//         ...data,
//         is_existing: !!data,
//       };
//     },
//     {
//       params: t.Object({
//         display_name: t.String(),
//       }),
//     }
//   )
//   // Get user by address
//   .get("/address/:address", async ({ params }) => {
//     const { data, error } = await supabase
//       .from("users")
//       .select("*")
//       .eq("address", params.address)
//       .limit(1)
//       .maybeSingle();

//     if (error) {
//       throw new Error("Failed to get user");
//     }

//     return data;
//   });
