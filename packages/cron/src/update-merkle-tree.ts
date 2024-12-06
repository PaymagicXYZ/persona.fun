import { buildHoldersTree, setTree } from "@persona/utils/src/merkle-tree";
import { ProofType } from "@persona/utils/src/proofs";
import { getTokens } from "@persona/db";

const BATCH_SIZE = 5;
const BATCH_DELAY = 1000; // 1 second delay between batches

async function buildAndCacheTree(
  tokenAddress: string,
  proofType: ProofType,
  minAmount: string
) {
  try {
    const nextTree = await buildHoldersTree({ tokenAddress, minAmount });
    if (!nextTree) {
      console.log(`No tree generated for ${tokenAddress} - ${proofType}`);
      return;
    }
    await setTree(tokenAddress, proofType, nextTree);
    console.log(`Updated tree for ${tokenAddress} - ${proofType}`);
  } catch (error) {
    console.error(`Error processing ${tokenAddress} - ${proofType}:`, error);
  }
}

async function processToken(token: {
  address: string;
  post_amount: string;
  delete_amount: string;
  promote_amount: string;
}) {
  const proofConfigs = [
    { type: ProofType.CREATE_POST, amount: token.post_amount },
    { type: ProofType.DELETE_POST, amount: token.delete_amount },
    { type: ProofType.PROMOTE_POST, amount: token.promote_amount },
  ];

  for (const config of proofConfigs) {
    await buildAndCacheTree(token.address, config.type, config.amount);
  }
}

const main = async () => {
  try {
    const tokens = await getTokens();
    console.log(`Starting update for ${tokens.length} tokens`);
    console.log(tokens);
    // Process tokens in batches
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const batch = tokens.slice(i, i + BATCH_SIZE);
      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
          tokens.length / BATCH_SIZE
        )}`
      );

      // Process each token in the batch
      await Promise.all(batch.map((token) => processToken(token)));

      // Add delay between batches if not the last batch
      if (i + BATCH_SIZE < tokens.length) {
        console.log(`Waiting ${BATCH_DELAY}ms before next batch...`);
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
      }
    }

    console.log("All tokens processed successfully");
  } catch (error) {
    console.error("Error in main process:", error);
    process.exit(1);
  }
};

main()
  .then(() => {
    console.log("Job completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
