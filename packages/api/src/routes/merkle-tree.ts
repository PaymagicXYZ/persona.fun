import { createElysia } from "../utils";
import { t } from "elysia";
import {
  buildHoldersTree,
  getTree,
  setTree,
} from "@persona/utils/src/merkle-tree";
import { ProofType } from "@persona/utils/src/proofs";
import { getToken, getTokens } from "@persona/db";

export const merkleTreeRoutes = createElysia({ prefix: "/merkle-tree" }).post(
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
);
