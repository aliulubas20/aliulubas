import {readFileSync} from "node:fs";
const config=JSON.parse(readFileSync("wrangler.jsonc","utf8"));
if(config.d1_databases[0].database_id==="00000000-0000-4000-8000-000000000000")throw new Error("Önce kendi D1 database_id değerini wrangler.jsonc dosyasına yaz.");

