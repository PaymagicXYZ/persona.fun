import { createElysia } from "../utils";
import { t } from "elysia";
import {
  buildHoldersTree,
  getTree,
  setTree,
} from "@persona/utils/src/merkle-tree";
import { ProofType } from "@persona/utils/src/proofs";
import { getToken, getTokens } from "@persona/db";

const CRON_SECRET = process.env.CRON_SECRET;

export const merkleTreeRoutes = createElysia({ prefix: "/merkle-tree" })
  .post(
    "/",
    async ({ body }) => {
      const cachedTree = await getTree(body.tokenAddress, body.proofType);

      if (cachedTree) {
        return cachedTree;
      }

      const config = await getToken(body.tokenAddress);

      let minAmount = config.post_amount;
      if (body.proofType === ProofType.DELETE_POST) {
        minAmount = config.delete_amount;
      } else if (body.proofType === ProofType.PROMOTE_POST) {
        minAmount = config.promote_amount;
      }

      const tree = await buildHoldersTree({
        tokenAddress: body.tokenAddress,
        minAmount,
      });

      await setTree(body.tokenAddress, body.proofType, tree);

      return tree;
    },
    {
      body: t.Object({
        tokenAddress: t.String(),
        proofType: t.Enum(ProofType),
      }),
    }
  )
  .get(
    "/update",
    async ({ headers }) => {
      console.log("ARE YOU CALLED?");
      const authHeader = headers.authorization;
      console.log(authHeader);
      if (
        !authHeader ||
        !authHeader.startsWith("Bearer ") ||
        authHeader !== `Bearer ${CRON_SECRET}`
      ) {
        return new Response("Unauthorized", { status: 401 });
      }

      try {
        const tokens = await getTokens();
        const batchSize = 5;
        const results: UpdateMerkleTreeResponse[] = [];
        console.log(tokens);
        // Process tokens in batches
        for (let i = 0; i < tokens.length; i += batchSize) {
          const batch = tokens.slice(i, i + batchSize);
          console.log(
            `batch ${i}: ${batch.length} tokens: ${tokens[i].address}`
          );
          const batchResults = await Promise.all(
            batch.map((token) => updateSingleTokenTree(token.address))
          );
          results.push(...batchResults);

          // Add delay between batches to prevent overwhelming the system
          if (i + batchSize < tokens.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        return results;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return {
          success: false,
          error: message,
          timestamp: Date.now(),
        };
      }
    },
    {
      headers: t.Object({
        authorization: t.String(),
      }),
    }
  );

interface UpdateMerkleTreeResponse {
  success: boolean;
  tokenAddress: string;
  updatedProofTypes: ProofType[];
  timestamp: number;
  error?: string;
}

async function updateSingleTokenTree(
  tokenAddress: string
): Promise<UpdateMerkleTreeResponse> {
  try {
    const config = await getToken(tokenAddress);
    const updatedProofTypes: ProofType[] = [];

    // Get typed ProofType values
    const proofTypes = [
      ProofType.CREATE_POST,
      ProofType.DELETE_POST,
      ProofType.PROMOTE_POST,
    ] as const;

    // Update tree for each proof type
    for (const proofType of proofTypes) {
      let minAmount = config.post_amount;
      if (proofType === ProofType.DELETE_POST) {
        minAmount = config.delete_amount;
      } else if (proofType === ProofType.PROMOTE_POST) {
        minAmount = config.promote_amount;
      }

      const tree = await buildHoldersTree({
        tokenAddress,
        minAmount,
      });

      console.log(tree);
      await setTree(tokenAddress, proofType, tree);
      updatedProofTypes.push(proofType);
    }

    return {
      success: true,
      tokenAddress,
      updatedProofTypes,
      timestamp: Date.now(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      tokenAddress,
      updatedProofTypes: [],
      timestamp: Date.now(),
      error: message,
    };
  }
}
