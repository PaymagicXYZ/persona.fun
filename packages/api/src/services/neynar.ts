import { getSignerForAddress, supabase } from "@persona/db";
import crypto from "crypto";
import { Redis } from "ioredis";
import {
  CreatePostParams,
  DeleteParams,
  GetBulkCastsResponse,
  GetBulkUsersResponse,
  GetCastResponse,
  GetCastsResponse,
  GetChannelResponse,
  GetUserResponse,
  PostCastResponse,
  QuoteCastParams,
  SubmitHashParams,
} from "./types";
import { gpt } from "./gpt-service";

const redis = new Redis(process.env.REDIS_URL as string);

class NeynarService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.neynar.com/v2";
  private static instance: NeynarService;

  private constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  static getInstance(): NeynarService {
    if (!NeynarService.instance) {
      const apiKey = process.env.NEYNAR_API_KEY;
      if (!apiKey) {
        throw new Error("NEYNAR_API_KEY environment variable is not set");
      }
      NeynarService.instance = new NeynarService(apiKey);
    }
    return NeynarService.instance;
  }

  private async makeRequest<T>(
    endpoint: string,
    options?: {
      method?: "GET" | "POST" | "DELETE" | "PATCH";
      maxRetries?: number;
      retryDelay?: number;
      body?: string;
    }
  ): Promise<T> {
    const { maxRetries = 1, retryDelay = 10000, method, body } = options ?? {};
    let retries = 0;

    while (retries < maxRetries) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-KEY": this.apiKey,
      };
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers,
        method,
        body,
      });

      if (response.status === 202 && maxRetries > 1) {
        retries++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }

      if (!response.ok) {
        console.error(await response.text());
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    }

    throw new Error("Maximum retries reached while waiting for data");
  }

  async validateFrame(message_bytes_in_hex: string) {
    return this.makeRequest<{ valid: boolean }>("/farcaster/frame/validate", {
      method: "POST",
      body: JSON.stringify({ message_bytes_in_hex }),
    });
  }

  async getCast(hash: string) {
    return this.makeRequest<GetCastResponse>(
      `/farcaster/cast?type=${
        hash.startsWith("0x") ? "hash" : "url"
      }&identifier=${hash}`
    );
  }

  async getUserByFid(fid: number) {
    const response = await this.makeRequest<{ users: GetUserResponse[] }>(
      `/farcaster/user/bulk?fids=${fid}`
    );

    return response.users[0];
  }

  async getChannel(identifier: string) {
    return this.makeRequest<GetChannelResponse>(
      `/farcaster/channel?id=${identifier}&type=id`
    );
  }

  async getUserByUsername(username: string) {
    return this.makeRequest<GetUserResponse>(
      `/farcaster/user/by_username?username=${username}`
    );
  }

  async getUserCasts(fid: number) {
    return this.makeRequest<GetCastsResponse>(
      `/farcaster/feed/user/casts?limit=150&include_replies=true&fid=${fid}`
    );
  }

  async getBulkCasts(hashes: string[]) {
    return this.makeRequest<GetBulkCastsResponse>(
      `/farcaster/casts?casts=${hashes.join(",")}`
    );
  }

  async post(params: {
    tokenAddress: string;
    text: string;
    embeds: string[];
    quote?: string;
    parent?: string;
    channel?: string;
  }) {
    const persona = await getSignerForAddress(params.tokenAddress);

    const transformedText = await gpt.transformInput(
      params.text,
      persona.persona_personality
    );

    const _params = {
      ...params,
      text: transformedText,
    };

    const embeds: Array<{
      url?: string;
      castId?: { hash: string; fid: number };
    }> = _params.embeds.map((embed) => ({
      url: embed,
    }));

    if (_params.quote) {
      const quote = await this.getCast(_params.quote);
      embeds.push({
        castId: {
          hash: quote.cast.hash,
          fid: quote.cast.author.fid,
        },
      });
    }

    let parentAuthorFid = undefined;
    if (_params.parent) {
      const parent = await this.getCast(_params.parent);
      parentAuthorFid = parent.cast.author.fid;
    }

    const body = {
      signer_uuid: persona.persona_signer_uuid,
      parent: _params.parent,
      parent_author_fid: parentAuthorFid,
      text: _params.text,
      embeds,
      channel_id: _params.channel,
    };

    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(body))
      .digest("hex");

    const exists = await redis.get(`post:hash:${hash}`);
    if (exists) {
      return {
        success: false,
      };
    }

    const response = await this.makeRequest<PostCastResponse>(
      "/farcaster/cast",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    if (!response.success) {
      return {
        success: false,
      };
    }

    await supabase.from("posts").insert({
      social_post_id: response.cast.hash,
      persona_id: persona.persona_id,
      platform: "farcaster",
      post: response.cast,
    });

    await redis.set(`post:hash:${hash}`, "true", "EX", 60 * 5);

    return response;
  }

  async delete(params: DeleteParams) {
    const persona = await getSignerForAddress(params.tokenAddress);
    const cast = await this.getCast(params.hash);
    if (!cast.cast) {
      return {
        success: false,
      };
    }

    await this.makeRequest("/farcaster/cast", {
      method: "DELETE",
      body: JSON.stringify({
        signer_uuid: persona.persona_signer_uuid,
        target_hash: params.hash,
      }),
    });

    return {
      success: true,
    };
  }

  async postAsQuote(params: QuoteCastParams) {
    const persona = await getSignerForAddress(params.tokenAddress);

    const body = {
      signer_uuid: persona.persona_signer_uuid,
      embeds: [
        {
          cast_id: {
            hash: params.quoteHash,
            fid: params.quoteFid,
          },
        },
      ],
    };

    const duplicateHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(body))
      .digest("hex");

    const exists = await redis.get(`post:hash:${duplicateHash}`);
    if (exists) {
      return {
        success: false,
      };
    }

    const response = await this.makeRequest<PostCastResponse>(
      "/farcaster/cast",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    if (!response.success) {
      return {
        success: false,
      };
    }

    await redis.set(`post:hash:${duplicateHash}`, "true", "EX", 60 * 5);

    return {
      success: true,
      hash: response.cast.hash,
    };
  }

  async getBulkUsers(addresses: string[]) {
    return this.makeRequest<GetBulkUsersResponse>(
      `/farcaster/user/bulk-by-address?addresses=${addresses.join(",")}`
    );
  }

  async getFid() {
    return this.makeRequest<{ fid: number }>("/farcaster/user/fid", {
      method: "GET",
    });
  }

  async registerUser(params: {
    signature: string;
    fid: number;
    requested_user_custody_address: string;
    deadline: number;
    fname: string;
  }) {
    return this.makeRequest<{
      success: boolean;
      message: string;
      signer: {
        signer_uuid: string;
        public_key: string;
        status: string;
        fid: number;
        permissions: Array<string>;
      };
    }>("/farcaster/user", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async updateUser(params: {
    signer_uuid: string;
    display_name: string;
    image_url: string;
  }) {
    return this.makeRequest("/farcaster/user", {
      method: "PATCH",
      body: JSON.stringify({
        ...params,
        pfp_url: params.image_url,
      }),
    });
  }

  async createClankerToken({
    signer_uuid,
    personaName,
    tokenName,
    tokenSymbol,
  }: {
    signer_uuid: string;
    personaName: string;
    tokenName: string;
    tokenSymbol: string;
  }) {
    return this.makeRequest("/farcaster/cast", {
      method: "POST",
      body: JSON.stringify({
        signer_uuid,
        text: `Hey @clanker, I'm ${personaName}, create token for me please name: ${tokenName} symbol: ${tokenSymbol}`,
        parent: "https://warpcast.com/clanker/0x3ff2f850", // Clankers token creation cast
      }),
    });
  }
}

export const neynar = NeynarService.getInstance();
