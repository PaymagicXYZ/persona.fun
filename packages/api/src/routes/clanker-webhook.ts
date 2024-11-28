import { Address, createPublicClient, erc20Abi, http, isAddress } from "viem";
import { createElysia } from "../utils";
import { t } from "elysia";
import { base } from "viem/chains";

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const clankerWebhookRoutes = createElysia({
  prefix: "/clanker-webhook",
}).post(
  "/",
  async ({ body }) => {
    console.log("Body: ", body.data.hash);
    // Return if not a cast.created event
    if (body.type !== "cast.created") {
      console.log("Not a cast.created event");
      return;
    }

    // Return if no embeds or URLs
    if (!body.data.embeds?.length) {
      console.log("No embeds found");
      return;
    }

    const address = body.data.embeds
      .find((embed) => {
        const match = embed.url.match(/\/clanker\/(0x[a-fA-F0-9]{40})/);
        return match && isAddress(match[1]);
      })
      ?.url.match(/\/clanker\/(0x[a-fA-F0-9]{40})/)?.[1];

    // Return if no address found
    if (!address) {
      console.log("No address found");
      return;
    }

    // TODO: Check if body.data.parent_author.fid is in the database else revert here
    // if() {}

    const [name, symbol, totalSupply] = await publicClient.multicall({
      contracts: [
        {
          address: address as Address,
          abi: erc20Abi,
          functionName: "name",
        },
        {
          address: address as Address,
          abi: erc20Abi,
          functionName: "symbol",
        },
        {
          address: address as Address,
          abi: erc20Abi,
          functionName: "totalSupply",
        },
      ],
    });

    console.log("Token info:", {
      address,
      name: name.result,
      symbol: symbol.result,
      totalSupply: totalSupply.result,
      hash: body.data.hash,
    });
  },
  {
    body: t.Object({
      type: t.String(),
      data: t.Object({
        hash: t.String(),
        parent_hash: t.String(),
        parent_author: t.Object({
          fid: t.Number(),
        }),
        embeds: t.Optional(
          t.Array(
            t.Object({
              url: t.String(),
            })
          )
        ),
      }),
    }),
  }
);
