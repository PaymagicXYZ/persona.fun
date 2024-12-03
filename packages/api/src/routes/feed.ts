import { Redis } from "ioredis";
import { createElysia } from "../utils";
import { t } from "elysia";
import { neynar } from "../services/neynar";
import { TOKEN_CONFIG } from "@persona/utils/src/config";
import { Cast, GetCastsResponse } from "../services/types";
import { getPostMappings, getPostReveals } from "@persona/db";
import { fetchTrendingPosts } from "../get-trending-posts";

const redis = new Redis(process.env.REDIS_URL as string);

export async function augmentCasts(casts: Cast[]) {
  const hashes = casts.map((cast) => cast.hash);
  const [reveals, mappings] = await Promise.all([
    getPostReveals(hashes),
    getPostMappings(hashes),
  ]);

  return casts
    .map((cast) => {
      const reveal = reveals.find(
        (reveal) =>
          reveal.reveal_hash &&
          reveal.cast_hash === cast.hash &&
          BigInt(reveal.reveal_hash) != BigInt(0)
      );
      if (!reveal) {
        return cast;
      }

      return {
        ...cast,
        reveal: {
          ...reveal,
          input: {
            text: cast.text,
            embeds: cast.embeds
              .filter((embed) => embed.url)
              .map((embed) => embed.url),
            quote: cast.embeds.find((e) => e.cast)?.cast?.hash ?? null,
            channel: cast.channel?.id ?? null,
            parent: cast.parent_hash ?? null,
          },
        },
      };
    })
    .map((cast) => {
      const mapping = mappings.find((m) => m.cast_hash === cast.hash);
      if (mapping) {
        return { ...cast, tweet_id: mapping.tweet_id };
      }
      return cast;
    });
}

export const feedRoutes = createElysia({ prefix: "/feed" })
  .get(
    "/:fid/new",
    async ({ params }) => {
      // let response: GetCastsResponse;
      // const cached = await redis.get(`new:${params.tokenAddress}`);
      // if (cached) {
      //   response = JSON.parse(cached);
      // } else {

      //   await redis.set(
      //     `new:${params.tokenAddress}`,
      //     JSON.stringify(response),
      //     "EX",
      //     30
      //   );
      // }

      const response = await neynar.getUserCasts(params.fid);

      return {
        casts: await augmentCasts(response.casts),
      };
    },
    {
      params: t.Object({
        fid: t.Number(),
      }),
    }
  )
  .get(
    "/:fid/trending",
    async ({ params }) => {
      const castsWithScores = await fetchTrendingPosts({ fid: params.fid });

      if (!castsWithScores) {
        return {
          casts: [],
        };
      }

      const hashes = castsWithScores.map((cast) => cast[0]);

      const response = await neynar.getBulkCasts(hashes);

      return {
        casts: await augmentCasts(response.result.casts),
      };
    },
    {
      params: t.Object({
        fid: t.Number(),
      }),
    }
  );
