import { t } from "elysia";
import { insertPersona, getPersonas, getPersonaByFid } from "@persona/db";
import {
  createElysia,
  generateNeynarSignature,
  createFCAccount,
} from "../utils";
import { neynar } from "../services/neynar";

/**
 * Flow:
 * 1. Register user on neynar
 * 2. Update user profile on neynar
 * 3. Get entire user profile from neynar ( 1. and 2. do not return it.....)
 * 4. Store user data in db
 * 5. Create token
 * 6. Listen for reply from clanker bot in webhook
 * 7. Store token data in db
 * 8. Update user profile with ref of token_id in db
 */

export const personaRoutes = createElysia({ prefix: "/personas" })
  .get("/", async () => getPersonas())
  .get("/fid/:fid", async ({ params }) => getPersonaByFid(params.fid), {
    params: t.Object({
      fid: t.Number(),
    }),
  })
  .post(
    "/",
    async ({ body }) => {
      try {
        console.log(0);

        // 1. Create FC account
        const fcAccount = await createFCAccount(body);
        console.log(1);
        // 2. Update user profile on neynar
        await neynar.updateUser({
          signer_uuid: fcAccount.response.signer.signer_uuid,
          display_name: body.display_name,
          image_url: body.image_url,
        });
        console.log(2);

        // 3. Get entire user profile from neynar
        const fcProfile = await neynar.getUserByFid(
          fcAccount.response.signer.fid
        );
        console.log(3);
        // 4. Store user data in db
        await insertPersona({
          fid: fcAccount.response.signer.fid,
          name: body.fname,
          image_url: body.image_url,
          signer_uuid: fcAccount.response.signer.signer_uuid,
          personality: "",
          private_key: fcAccount.privateKey,
          fc_profile: fcProfile,
        });
        console.log(4);
        // 5. Create token

        // const response = await neynar.createClankerToken({
        //   personaName: body.name,
        //   tokenName: "Batman",
        //   tokenSymbol: "B",
        //   signer_uuid: fcAccount.response.signer.signer_uuid,
        // });

        // console.log(response);
        console.log("fc account", fcAccount);
      } catch (error) {
        console.error("Error registering persona: ", error);
      }
    },
    {
      body: t.Object({
        fname: t.String(),
        image_url: t.String(),
        display_name: t.String(),
      }),
    }
  );
