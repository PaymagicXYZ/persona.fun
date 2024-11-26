import { getTokenConfig } from "@persona/db";
import { createElysia } from "../utils";
import { t } from "elysia";

export const tokenConfigRoutes = createElysia({ prefix: "/token-config" }).get(
  "/:tokenAddress",
  async ({ params }) => getTokenConfig(params.tokenAddress),
  {
    params: t.Object({
      tokenAddress: t.String(),
    }),
  }
);
