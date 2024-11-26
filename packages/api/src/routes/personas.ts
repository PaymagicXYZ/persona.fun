import { getPersonas } from "@persona/db";
import { createElysia } from "../utils";

export const personaRoutes = createElysia({ prefix: "/personas" }).get(
  "/",
  async () => getPersonas()
);
