import { supabase } from "@persona/db";
import { createElysia } from "../utils";
import { t } from "elysia";
import { recoverTypedDataAddress } from "viem";

const types = {
  WaitlistEntry: [{ name: "email", type: "string" }],
} as const;

const domain = {
  name: "Interns.fun Waitlist",
  version: "1",
} as const;

export const waitlistRoutes = createElysia({ prefix: "/waitlist" }).post(
  "/",
  async ({ body }) => {
    const { signature, raw_message } = body;

    const address = await recoverTypedDataAddress({
      domain,
      types,
      primaryType: "WaitlistEntry",
      message: raw_message,
      signature: signature as `0x${string}`,
    });

    await supabase.from("waitlist").insert({
      email: raw_message.email,
      address,
    });
  },
  {
    body: t.Object({
      signature: t.String(),
      raw_message: t.Object({
        email: t.String(),
      }),
    }),
  }
);
