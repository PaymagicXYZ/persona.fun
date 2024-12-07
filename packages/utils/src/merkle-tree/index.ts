import { buildMimc7 as buildMimc } from "circomlibjs";
import { MerkleTreeMiMC, MiMC7 } from "../proofs/merkle-tree";
import { Redis } from "ioredis";
import { ProofType, Tree } from "../proofs";

const redis = new Redis(process.env.REDIS_URL as string);

interface BuildTreeArgs {
  tokenAddress: string;
  minAmount: string;
  maxAmount?: string;
}

export async function buildHoldersTree(args: BuildTreeArgs) {
  const mimc = await buildMimc();

  const merkleTree = new MerkleTreeMiMC(13, mimc);

  const owners = await fetchHolders(args);

  for (const owner of owners) {
    const commitment = MiMC7(
      mimc,
      owner.address.toLowerCase().replace("0x", ""),
      BigInt(owner.balance).toString(16).replace("0x", "")
    );
    merkleTree.insert(commitment);
  }

  const root = `0x${merkleTree.root()}`;

  const elements = owners.map((owner, index) => {
    return {
      path: merkleTree.proof(index).pathElements.map((p) => `0x${p}` as string),
      address: owner.address,
      balance: owner.balance,
    };
  });

  const tree = {
    root,
    elements,
  };

  return tree;
}

async function fetchHolders(args: BuildTreeArgs) {
  const owners: Array<{ address: string; balance: string }> = []
  const baseUrl = `https://api.simplehash.com/api/v0/fungibles/top_wallets`
  const headers = {
    Accept: "application/json",
    "X-API-KEY": process.env.SIMPLEHASH_API_KEY ?? ""
  }

  const MAX_PAGES = 100 // Prevent infinite loops
  let currentPage = 0
  let cursor = ""

  while (currentPage < MAX_PAGES) {
    currentPage++
    const url = `${baseUrl}?fungible_id=base.${args.tokenAddress}&limit=50${cursor ? `&cursor=${cursor}` : ""}`;

    console.log("fetching holders URL: ", url);
    console.log("fetching holders headers: ", headers);

    let retries = 5;
    let response;

    while (retries > 0) {
      try {
        response = await fetch(url, { headers });

        if (response.ok) break;
        console.log("fetchHolders response: ", response);
        throw new Error(`HTTP error! status: ${response.status}`);
      } catch (error) {
        console.log("error in fetchHolders", error);
        retries--;
        if (retries === 0) throw error;
        const delay = parseInt(response?.headers.get("Retry-After") ?? "5");
        console.log(`Retrying in ${delay} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay * 1000));
      }
    }

    const res = await response!.json();

    let shouldBreak = false;
    for (const owner of res.owners) {
      if (BigInt(owner.quantity_string) >= BigInt(args.minAmount)) {
        owners.push({
          address: owner.owner_address.toLowerCase(),
          balance: owner.quantity_string,
        });
      } else {
        shouldBreak = true;
        break;
      }
    }

    cursor = res.next_cursor;
    if (!cursor || cursor === "" || shouldBreak) return owners
  }

  console.warn(`Reached maximum page limit (${MAX_PAGES}) while fetching holders`)
  return owners
}

export async function getTree(
  tokenAddress: string,
  proofType: ProofType
): Promise<Tree> {
  const key = `anon:tree:${tokenAddress.toLowerCase()}:${proofType}`;
  const tree = await redis.get(key);
  return tree ? JSON.parse(tree) : null;
}

export async function setTree(
  tokenAddress: string,
  proofType: ProofType,
  tree: Tree
) {
  const key = `anon:tree:${tokenAddress.toLowerCase()}:${proofType}`;

  await redis.set(key, JSON.stringify(tree));

  await addRoot(tokenAddress, proofType, tree.root);
}

export async function addRoot(
  tokenAddress: string,
  proofType: ProofType,
  root: string,
  maxRoots = 5
) {
  const key = `anon:roots:${tokenAddress.toLowerCase()}:${proofType}`;

  await redis.lpush(key, root);
  await redis.ltrim(key, 0, maxRoots - 1);
}

export async function getValidRoots(
  tokenAddress: string,
  proofType: ProofType
): Promise<string[]> {
  const key = `anon:roots:${tokenAddress.toLowerCase()}:${proofType}`;

  const result = await redis.lrange(key, 0, -1);

  return result;
}
