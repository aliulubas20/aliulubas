import {randomBytes,createHash} from "node:crypto";
import {spawnSync} from "node:child_process";
import {writeFileSync} from "node:fs";
const password=randomBytes(32).toString("base64url");
const hash=createHash("sha256").update(password).digest("hex");
if(process.argv.includes("--local")){
 writeFileSync(".dev.vars","ADMIN_PASSWORD_HASH="+hash+"\n",{mode:0o600});
}else{
 const result=spawnSync(process.execPath,["node_modules/wrangler/bin/wrangler.js","secret","put","ADMIN_PASSWORD_HASH","--config","wrangler.jsonc"],{input:hash,stdio:["pipe","inherit","inherit"]});
 if(result.status!==0)process.exit(result.status||1);
}
console.log("\nYENİ YÖNETİCİ ŞİFREN (güvenli bir yere kaydet, GitHub'a koyma):\n"+password+"\n");
console.log("Şifre değiştirilince önceki oturumlar geçersiz olur.");

