// import { Cast, GetCastsResponse } from "@persona/api/src/services/types";
import {
  bytesToHexString,
  createDefaultMetadataKeyInterceptor,
  getSSLHubRpcClient,
} from "@farcaster/hub-nodejs";
import { Cast, GetCastsResponse } from "./services/types";
// import Redis from "ioredis";

// const redis = new Redis(process.env.REDIS_URL as string);

const client = getSSLHubRpcClient("hub-grpc-api.neynar.com", {
  interceptors: [
    createDefaultMetadataKeyInterceptor(
      "x-api-key",
      process.env.NEYNAR_API_KEY as string
    ),
  ],
});

async function getCastMessages(fid: number) {
  const casts = await client.getAllCastMessagesByFid({
    fid,
  });

  if (casts.isErr()) {
    return [];
  }
  return casts.value.messages;
}

async function getCastData(hashes: string[]): Promise<Cast[]> {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/casts?casts=${hashes.join(",")}`,
    {
      headers: {
        "x-api-key": process.env.NEYNAR_API_KEY as string,
        Accept: "application/json",
      },
    }
  );
  const data: { result: GetCastsResponse } = await response.json();

  const casts = data?.result?.casts?.filter(
    (cast: Cast | null): cast is Cast => {
      return cast !== null && cast !== undefined && typeof cast === "object";
    }
  );

  return casts;
}

export async function fetchTrendingPosts({ fid }: { fid: number }) {
  const messages = await getCastMessages(fid);

  if (messages.length === 0) {
    return;
  }

  const hashes = messages.map((message) =>
    bytesToHexString(message.hash)._unsafeUnwrap()
  );

  const batchSize = 100;
  const casts: Cast[] = [];
  for (let i = 0; i < hashes.length; i += batchSize) {
    const batch = hashes.slice(i, i + batchSize);
    const castData = await getCastData(batch);

    if (castData) {
      casts.push(...castData);
    }
  }

  const now = Date.now();

  const castScores: Record<string, number> = {};
  for (const cast of casts) {
    const ageInHours = (now - new Date(cast.timestamp).getTime()) / 3600000;
    const score = (cast.reactions.likes_count || 0) / (ageInHours + 2) ** 1.5;
    castScores[cast.hash] = score;
  }

  const sortedCasts = Object.entries(castScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);

  // await redis.set(`trending:${ANON_ADDRESS}`, JSON.stringify(sortedCasts))
  return sortedCasts;
}
