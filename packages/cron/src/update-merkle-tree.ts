import { buildHoldersTree, setTree } from "@persona/utils/src/merkle-tree";
import { TOKEN_CONFIG, ANON_ADDRESS } from "@persona/utils/src/config";
import { ProofType } from "@persona/utils/src/proofs";

const main = async () => {
  const config = TOKEN_CONFIG[ANON_ADDRESS];
  await buildAndCacheTree(
    ANON_ADDRESS,
    ProofType.CREATE_POST,
    config.postAmount
  );
  await buildAndCacheTree(
    ANON_ADDRESS,
    ProofType.DELETE_POST,
    config.deleteAmount
  );
  await buildAndCacheTree(
    ANON_ADDRESS,
    ProofType.PROMOTE_POST,
    config.promoteAmount
  );
};

main().then(() => {
  process.exit(0);
});

async function buildAndCacheTree(
  tokenAddress: string,
  proofType: ProofType,
  minAmount: string
) {
  const nextTree = await buildHoldersTree({ tokenAddress, minAmount });
  if (!nextTree) {
    return;
  }
  // console.log(proofType, nextTree.root)
  await setTree(tokenAddress, proofType, nextTree);
}
