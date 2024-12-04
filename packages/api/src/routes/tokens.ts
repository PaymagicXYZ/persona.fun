import { getToken, getTokens } from "@persona/db";
import { createElysia } from "../utils";
import { t } from "elysia";

export const tokensRoutes = createElysia({ prefix: "/tokens" })
  .get("/", async () => getTokens())
  .get("/:tokenAddress", async ({ params }) => getToken(params.tokenAddress), {
    params: t.Object({
      tokenAddress: t.String(),
    }),
  });
