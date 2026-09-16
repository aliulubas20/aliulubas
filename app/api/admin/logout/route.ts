import {env} from "cloudflare:workers";
import {COOKIE,cookieValue,digest,sameOrigin} from "@/lib/admin-crypto";
export async function POST(req:Request){
 if(!sameOrigin(req))return new Response("Geçersiz istek",{status:403});
 const token=cookieValue(req.headers.get("cookie"));
 if(env.DB&&token)await env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash=?").bind(await digest(token)).run();
 return new Response(null,{status:303,headers:{location:"/admin","cache-control":"no-store","set-cookie":`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`}});
}

