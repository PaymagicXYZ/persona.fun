import "dotenv/config";

import { supabase } from "./config";
import { getAddress } from "viem";

const personaSelect = `
      id, 
      name, 
      fid,
      eliza_character,
      image_url, 
      token:token_id (
        id,
        address,
        name,
        symbol,
        supply,
        image_url,
        post_amount,
        delete_amount,
        promote_amount,
        base_scan_url,
        dex_screener_url
      )
    `;

export async function getPersonas() {
  const { data, error } = await supabase.from("personas").select(personaSelect);
  console.log("error", error);
  if (error) {
    throw error;
  }
  return data;
}

export async function getPersonaByFid(fid: number) {
  const { data, error } = await supabase
    .from("personas")
    .select(personaSelect)
    .eq("fid", fid)
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getSignerForAddress(address: string) {
  const { data, error } = await supabase
    .rpc("get_persona_by_token_address", {
      search_address: getAddress(address),
    })
    .limit(1)
    .single();

  console.log("data", data);
  console.log("error", error);
  if (error) {
    throw error;
  }

  return data;
}

export async function getToken(tokenAddress: string) {
  const { data, error } = await supabase
    .from("tokens")
    .select("*")
    .eq("address", tokenAddress)
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getTokens() {
  const { data, error } = await supabase
    .from("tokens")
    .select(
      "address, name, symbol, supply, post_amount, delete_amount, promote_amount, decimals"
    );
  if (error) {
    throw error;
  }
  return data;
}

export const insertPersona = async (persona: {
  fid: number;
  name: string;
  image_url: string;
  signer_uuid: string;
  personality: string;
  private_key: string;
  fc_profile: any;
}) => {
  const { data, error } = await supabase
    .from("personas")
    .insert({
      fid: persona.fid,
      name: persona.name,
      image_url: persona.image_url,
      signer_uuid: persona.signer_uuid,
      personality: persona.personality,
      private_key: persona.private_key,
      fc_profile: persona.fc_profile,
    })
    .select("id, fid, signer_uuid")
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export async function createPostMapping(
  castHash: string,
  tweetId?: string,
  bestOfHash?: string
) {
  const { data, error } = await supabase
    .from("post_mapping")
    .upsert(
      { cast_hash: castHash, tweet_id: tweetId, best_of_hash: bestOfHash },
      { onConflict: "cast_hash" }
    );

  if (error) {
    throw error;
  }

  return data;
}

export async function getPostMapping(castHash: string) {
  const { data, error } = await supabase
    .from("post_mapping")
    .select()
    .eq("cast_hash", castHash)
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deletePostMapping(castHash: string) {
  const { data, error } = await supabase
    .from("post_mapping")
    .delete()
    .eq("cast_hash", castHash);

  if (error) {
    throw error;
  }

  return data;
}

export async function getPostMappings(castHashes: string[]) {
  const { data, error } = await supabase
    .from("post_mapping")
    .select()
    .in("cast_hash", castHashes);

  if (error) {
    throw error;
  }

  return data;
}

export async function createPostReveal(castHash: string, revealHash: string) {
  const { data, error } = await supabase
    .from("post_reveal")
    .upsert(
      { cast_hash: castHash, reveal_hash: revealHash },
      { onConflict: "cast_hash" }
    );

  if (error) {
    throw error;
  }

  return data;
}

export async function getPostReveal(castHash: string) {
  const { data, error } = await supabase
    .from("post_reveal")
    .select()
    .eq("cast_hash", castHash)
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function markPostReveal(
  castHash: string,
  revealPhrase: string,
  signature: string,
  address: string
) {
  const { data, error } = await supabase
    .from("post_reveal")
    .update({
      reveal_phrase: revealPhrase,
      signature,
      address,
      revealed_at: new Date(),
    })
    .eq("cast_hash", castHash);

  if (error) {
    throw error;
  }
}

export async function getPostReveals(castHashes: string[]) {
  const { data, error } = await supabase
    .from("post_reveal")
    .select()
    .in("cast_hash", castHashes);

  if (error) {
    throw error;
  }

  return data;
}
