import { getToken, getTokens } from "@persona/db";
import { createElysia } from "../utils";
import { t } from "elysia";

export const tokensRoutes = createElysia({ prefix: "/tokens" })
  .get("/", async () => getTokens())
  .get("/:tokenAddress", async ({ params }) => getToken(params.tokenAddress), {
    params: t.Object({
      tokenAddress: t.String(),
    }),
  })
  .get(
    "/token-holders",
    async ({ query }) => {
      // TODO: Move in simplehash service
      const tokenAddresses =
        typeof query.tokenAddresses === "string"
          ? query.tokenAddresses.split(",")
          : query.tokenAddresses;

      console.log("tokenAddr", tokenAddresses);

      const cleanedAddresses = tokenAddresses
        .map((addr) => addr.trim())
        .filter(Boolean)
        .map((address) => `base.${address}`);

      const baseUrl = `https://api.simplehash.com/api/v0/fungibles/assets?fungible_ids=${cleanedAddresses.join(
        ","
      )}`;
      const headers = {
        Accept: "application/json",
        "X-API-KEY": process.env.SIMPLEHASH_API_KEY ?? "",
      };

      console.log(baseUrl);

      try {
        const response = await fetch(baseUrl, { headers });
        if (!response.ok) {
          throw new Error(`SimpleHash API error: ${response.statusText}`);
        }

        const rawData = await response.json();

        const data = rawData?.fungibles
          ? rawData.fungibles
          : rawData
          ? [rawData]
          : [];

        // Transform the response into a mapped object
        const mappedResponse = data.reduce(
          (acc: { [key: string]: number }, token: any) => {
            const address = token.fungible_id.replace("base.", "");
            acc[address] = token.holder_count;
            return acc;
          },
          {}
        );

        return mappedResponse;
      } catch (error) {
        console.error("Error fetching token holders:", error);
        throw error;
      }
    },
    {
      query: t.Object({
        tokenAddresses: t.Union([t.String(), t.Array(t.String())]),
      }),
    }
  );
