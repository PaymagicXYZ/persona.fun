import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { postMappingTable, postRevealTable, signersTable } from './db/schema'
import { eq, inArray } from 'drizzle-orm'
import { supabase } from './config'
import { getAddress } from 'viem'

export async function getPersonas() {
  const { data, error } = await supabase.from('personas').select(`
      id, 
      name, 
      fid, 
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
    `)

  if (error) {
    throw error
  }

  return data
}

export async function getPersonaByFid(fid: number) {
  const { data, error } = await supabase
    .from('personas')
    .select(`
      id, 
      name, 
      fid, 
      image_url,
      personality,
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
      )
    `)
    .eq('fid', fid)
    .limit(1)
    .single()

  if (error) {
    throw error
  }

  return data
}

const db = drizzle(process.env.DATABASE_URL as string)

export async function getSignerForAddress(address: string) {
  // const [user] = await db
  //   .select()
  //   .from(signersTable)
  //   .where(eq(signersTable.address, address))
  //   .limit(1);
  // return user;

  const { data, error } = await supabase
    .rpc('get_persona_by_token_address', {
      search_address: getAddress(address),
    })
    .limit(1)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getTokenConfig(tokenAddress: string) {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('address', tokenAddress)
    .limit(1)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createSignerForAddress(address: string, signerUuid: string) {
  const [user] = await db
    .insert(signersTable)
    .values({ address, signerUuid })
    .onConflictDoUpdate({ target: signersTable.address, set: { signerUuid } })
    .returning()
  return user
}

export async function createPostMapping(
  castHash: string,
  tweetId?: string,
  bestOfHash?: string
) {
  await db
    .insert(postMappingTable)
    .values({ castHash, tweetId, bestOfHash })
    .onConflictDoNothing()
}

export async function getPostMapping(castHash: string) {
  const [row] = await db
    .select()
    .from(postMappingTable)
    .where(eq(postMappingTable.castHash, castHash))
    .limit(1)
  return row
}

export async function deletePostMapping(castHash: string) {
  await db.delete(postMappingTable).where(eq(postMappingTable.castHash, castHash))
}

export async function getPostMappings(castHashes: string[]) {
  const rows = await db
    .select()
    .from(postMappingTable)
    .where(inArray(postMappingTable.castHash, castHashes))
  return rows
}

export async function createPostReveal(castHash: string, revealHash: string) {
  await db.insert(postRevealTable).values({ castHash, revealHash })
}

export async function getPostReveal(castHash: string) {
  const [row] = await db
    .select()
    .from(postRevealTable)
    .where(eq(postRevealTable.castHash, castHash))
    .limit(1)
  return row
}

export async function markPostReveal(
  castHash: string,
  revealPhrase: string,
  signature: string,
  address: string
) {
  await db
    .update(postRevealTable)
    .set({ revealPhrase, signature, address, revealedAt: new Date() })
    .where(eq(postRevealTable.castHash, castHash))
}

export async function getPostReveals(castHashes: string[]) {
  const rows = await db
    .select()
    .from(postRevealTable)
    .where(inArray(postRevealTable.castHash, castHashes))
  return rows
}
