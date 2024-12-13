import { getToken, getTokenBySymbol, getTokens, supabase } from "@persona/db";
import { aggregateTips, createElysia, delay, TipWithToken } from "../utils";
import { t } from "elysia";
import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  Hex,
  http,
} from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

let MOCKED_TIPS = [
  {
    user_address: "0x77B4922Fcc0Fa745Bcd7d76025E682CFfFc9a149",
    token_address: "0xcf231a6fc048b5f1772fc2c1fb9896da19221b60",
    value: 1,
    image_url:
      "https://res.cloudinary.com/duhvlptwp/image/upload/v1733851919/IMG_3578_clcp4a.png",
    symbol: "SAFEINTERN",
  },
  {
    user_address: "0x77B4922Fcc0Fa745Bcd7d76025E682CFfFc9a149",
    token_address: "0xd3f35bc5e6f32849cf4ae8e814203e62e928f7d8",
    value: 2,
    image_url:
      "https://res.cloudinary.com/duhvlptwp/image/upload/v1733850896/IMG_3575_wmcubu.png",
    symbol: "EIGENINTERN",
  },
  {
    user_address: "0x77B4922Fcc0Fa745Bcd7d76025E682CFfFc9a149",
    token_address: "0x49057bfa7d1ffc7970ba50e6d9c13e7f2c623a43",
    value: 3,
    image_url:
      "https://res.cloudinary.com/duhvlptwp/image/upload/v1733851971/IMG_3579_js1vkv.png",
    symbol: "BASEINTERN",
  },
  {
    user_address: "0x74427681c620DE258Aa53a382d6a4C865738A06C",
    token_address: "0xcf231a6fc048b5f1772fc2c1fb9896da19221b60",
    value: 2500,
    image_url:
      "https://res.cloudinary.com/duhvlptwp/image/upload/v1733851919/IMG_3578_clcp4a.png",
    symbol: "SAFEINTERN",
  },
  {
    user_address: "0x74427681c620DE258Aa53a382d6a4C865738A06C",
    token_address: "0xd3f35bc5e6f32849cf4ae8e814203e62e928f7d8",
    value: 2300,
    image_url:
      "https://res.cloudinary.com/duhvlptwp/image/upload/v1733850896/IMG_3575_wmcubu.png",
    symbol: "EIGENINTERN",
  },
  {
    user_address: "0x74427681c620DE258Aa53a382d6a4C865738A06C",
    token_address: "0x49057bfa7d1ffc7970ba50e6d9c13e7f2c623a43",
    value: 1700,
    image_url:
      "https://res.cloudinary.com/duhvlptwp/image/upload/v1733850896/IMG_3575_wmcubu.png",
    symbol: "BASEINTERN",
  },
];

const account = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

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
            if (!token) {
              return acc;
            }

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
  )
  .get(
    "/symbol/:symbol",
    async ({ params }) => getTokenBySymbol(params.symbol),
    {
      params: t.Object({
        symbol: t.String(),
      }),
    }
  )
  .get(
    "/eligibility/:user_address",
    async ({ params }) => {
      const user_address = params.user_address;

      const { data: tips, error } = await supabase
        .from("tips")
        .select(
          `
          *,
          token:tokens(
            id,
            address,
            symbol,
            name,
            image_url
          )
        `
        )
        .ilike("address", `%${user_address}%`)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching tips", error);
        throw new Error("Error fetching tips");
      }

      const aggregatedTips = aggregateTips(tips as TipWithToken[]);

      return Object.keys(aggregatedTips).length ? aggregatedTips : null;
    },
    {
      params: t.Object({
        user_address: t.String(),
      }),
    }
  )
  .get("/claim/:user_address", async ({ params }) => {
    const { data: tips, error } = await supabase
      .from("tips")
      .select(
        `
        *,
        token:tokens(
          id,
          address,
          symbol,
          name,
          image_url
        )
      `
      )
      .ilike("address", `%${params.user_address}%`)
      .eq("status", "pending");

    if (error) throw new Error("Error fetching tips");

    const aggregatedTips = aggregateTips(tips as TipWithToken[]);
    const results = [];

    for (const [tokenAddress, data] of Object.entries(aggregatedTips)) {
      try {
        const hash = await walletClient.writeContract({
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "transfer",
          args: [
            params.user_address as `0x${string}`,
            BigInt(Math.floor(data.amount * 1e18)),
          ],
        });

        await publicClient.waitForTransactionReceipt({ hash });

        const tipsToUpdate = tips
          .filter((tip) => tip.token?.address === tokenAddress)
          .map(({ token, ...tipData }) => ({
            ...tipData,
            status: "processed" as const,
            tx_hash: hash,
          }));

        await supabase.from("tips").upsert(tipsToUpdate);

        results.push({
          token_address: tokenAddress,
          amount: data.amount,
          hash,
          status: "success",
        });

        await delay(300);
      } catch (error) {
        results.push({
          token_address: tokenAddress,
          amount: data.amount,
          error: (error as Error).message,
          status: "failed",
        });
      }
    }

    return { user_address: params.user_address, transactions: results };
  });
