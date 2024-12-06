import { buildHoldersTree, setTree } from "@persona/utils/src/merkle-tree"
import { ProofType } from "@persona/utils/src/proofs"
import { getTokens } from "@persona/db"

export interface Token {
  address: string
  post_amount: string
  delete_amount: string
  promote_amount: string
}

export async function buildAndCacheTree(
  tokenAddress: string,
  proofType: ProofType,
  minAmount: string
) {
  try {
    const nextTree = await buildHoldersTree({ tokenAddress, minAmount })
    if (!nextTree) {
      console.log(`No tree generated for ${tokenAddress} - ${proofType}`)
      return
    }
    await setTree(tokenAddress, proofType, nextTree)
    console.log(`Updated tree for ${tokenAddress} - ${proofType}`)
  } catch (error) {
    console.error(`Error processing ${tokenAddress} - ${proofType}:`, error)
  }
}

export async function processToken(token: Token) {
  const proofConfigs = [
    { type: ProofType.CREATE_POST, amount: token.post_amount },
    { type: ProofType.DELETE_POST, amount: token.delete_amount },
    { type: ProofType.PROMOTE_POST, amount: token.promote_amount },
  ]

  for (const config of proofConfigs) {
    await buildAndCacheTree(token.address, config.type, config.amount)
  }
}

export async function updateMerkleTree(batchSize = 5, batchDelay = 1000) {
  try {
    const tokens = await getTokens()
    console.log(`Starting update for ${tokens.length} tokens`)
    
    // Process tokens in batches
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize)
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          tokens.length / batchSize
        )}`
      )

      // Process each token in the batch
      await Promise.all(batch.map((token) => processToken(token)))

      // Add delay between batches if not the last batch
      if (i + batchSize < tokens.length) {
        console.log(`Waiting ${batchDelay}ms before next batch...`)
        await new Promise((resolve) => setTimeout(resolve, batchDelay))
      }
    }

    console.log("All tokens processed successfully")
    return true
  } catch (error) {
    console.error("Error in update process:", error)
    throw error
  }
}

// Export types and functions
export { ProofType } 