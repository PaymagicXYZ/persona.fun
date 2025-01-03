import { t } from "elysia";
import { createElysia } from "./utils";
import { feedRoutes } from "./routes/feed";
import { merkleTreeRoutes } from "./routes/merkle-tree";
import { getPostRoutes } from "./routes/post";
import { uploadRoutes } from "./routes/upload";
import { neynar } from "./services/neynar";
import { getProvingBackend, ProofType } from "@persona/utils/src/proofs";
import { personaRoutes } from "./routes/personas";
import { clankerWebhookRoutes } from "./routes/clanker-webhook";
import { tokensRoutes } from "./routes/tokens";
import { waitlistRoutes } from "./routes/waitlist";
// import { usersRoutes } from "./routes/users";
// import { chatRoutes } from "./routes/chat";
(async () => {
  const [createPostBackend, submitHashBackend] = await Promise.all([
    getProvingBackend(ProofType.CREATE_POST),
    getProvingBackend(ProofType.PROMOTE_POST),
  ]);
  const postRoutes = getPostRoutes(createPostBackend, submitHashBackend);

  const app = createElysia()
    .use(feedRoutes)
    .use(merkleTreeRoutes)
    .use(postRoutes)
    .use(uploadRoutes)
    .use(personaRoutes)
    // .use(clankerWebhookRoutes)
    .use(tokensRoutes)
    .use(waitlistRoutes)
    // .use(usersRoutes)
    // .use(chatRoutes)
    .get(
      "/get-cast",
      async ({ query }) => {
        const response = await neynar.getCast(query.identifier);
        return response.cast;
      },
      {
        query: t.Object({
          identifier: t.String(),
        }),
      }
    )
    .get(
      "/get-channel",
      async ({ query }) => {
        const response = await neynar.getChannel(query.identifier);
        return response.channel;
      },
      {
        query: t.Object({
          identifier: t.String(),
        }),
      }
    )
    .get(
      "/validate-frame",
      async ({ query }) => {
        return await neynar.validateFrame(query.data);
      },
      {
        query: t.Object({
          data: t.String(),
        }),
      }
    )
    .get(
      "/identity",
      async ({ query }) => {
        const users = await neynar.getBulkUsers([query.address.toLowerCase()]);
        return users?.[query.address.toLowerCase()]?.[0];
      },
      {
        query: t.Object({
          address: t.String(),
        }),
      }
    );

  app.listen(3002);

  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
})();
