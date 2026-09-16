import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 DB bağlantısı eksik. wrangler.jsonc içindeki d1_databases ayarını kontrol edin."
    );
  }

  return drizzle(env.DB, { schema });
}
