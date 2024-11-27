import { getPersonas } from "@persona/db";
import { createElysia } from "../utils";
import { webhookService } from "../services/webhook-service"

export const personaRoutes = createElysia({ prefix: "/personas" }).get(
  "/",
  async () => getPersonas()
).post("/", async ({ body }) => {
  // ... existing persona creation logic ...
  
  // Update webhook FIDs after creating new persona
  await webhookService.updateWebhookFids()
  
  return { success: true }
})
