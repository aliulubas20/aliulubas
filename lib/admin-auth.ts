import {env} from "cloudflare:workers";
import {headers} from "next/headers";
import {cookieValue,digest} from "./admin-crypto";
export async function getAdmin(){
 if(!env.DB||!env.ADMIN_PASSWORD_HASH)return null;
 const token=cookieValue((await headers()).get("cookie"));if(!/^[a-f0-9]{64}$/.test(token))return null;
 const row=await env.DB.prepare("SELECT token_hash FROM admin_sessions WHERE token_hash=? AND expires_at>? AND credential_version=?").bind(await digest(token),Date.now(),await digest(env.ADMIN_PASSWORD_HASH)).first();
 return row?{displayName:"Ali Ulubaş"}:null;
}
export async function consumeLimit(req:Request,kind:string,limit:number){
 if(!env.DB)return false;
 const now=Date.now(),window=Math.floor(now/900000);
 const key=await digest(kind+":"+window+":"+(req.headers.get("cf-connecting-ip")||"local"));
 await env.DB.prepare("DELETE FROM auth_limits WHERE expires_at<?").bind(now).run();
 const row=await env.DB.prepare("INSERT INTO auth_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count").bind(key,(window+1)*900000).first<{count:number}>();
 return Boolean(row&&row.count<=limit);
}

