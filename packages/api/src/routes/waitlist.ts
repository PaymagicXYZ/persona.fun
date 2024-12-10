import { supabase } from "@persona/db";
import { createElysia } from "../utils";
import { t } from "elysia";

export const waitlistRoutes = createElysia({ prefix: "/waitlist" }).post(
  "/",
  async ({ body }) => {
    const { email } = body;

    await supabase.from("waitlist").insert({
      email,
    });
  },
  {
    body: t.Object({
      email: t.String(),
    }),
  }
);
