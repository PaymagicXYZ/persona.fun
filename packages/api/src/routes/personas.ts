import { getPersonas } from "@anon/db";
import { createElysia } from "../utils";

export const personaRoutes = createElysia({ prefix: "/personas" }).get(
  "/",
  async () => {
    return await getPersonas();
  }
);
