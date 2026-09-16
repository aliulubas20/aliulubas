import {env} from "cloudflare:workers";
import {COOKIE,digest,equal,randomToken,sameOrigin} from "@/lib/admin-crypto";
import {consumeLimit} from "@/lib/admin-auth";
export async function POST(req:Request){
 const fail=(error:string,status:number)=>Response.json({error},{status,headers:{"cache-control":"no-store"}});
 if(!sameOrigin(req))return fail("Geçersiz istek",403);
 if(!env.DB||!/^[a-f0-9]{64}$/.test(env.ADMIN_PASSWORD_HASH||""))return fail("Yönetici girişi henüz kurulmadı.",503);
 if(!await consumeLimit(req,"login",10))return fail("Çok fazla deneme. 15 dakika sonra tekrar dene.",429);
 if(Number(req.headers.get("content-length")||0)>2048)return fail("İstek çok büyük",413);
 let password="";try{const body=await req.text();if(body.length>2048)return fail("İstek çok büyük",413);password=JSON.parse(body).password;}catch{return fail("Geçersiz istek",400)}
 if(typeof password!=="string"||password.length>128||!equal(await digest(password),env.ADMIN_PASSWORD_HASH!))return fail("Şifre hatalı.",401);
 const token=randomToken(),now=Date.now();
 await env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at<?").bind(now).run();
 await env.DB.prepare("INSERT INTO admin_sessions(token_hash,expires_at,credential_version) VALUES(?,?,?)").bind(await digest(token),now+28800000,await digest(env.ADMIN_PASSWORD_HASH!)).run();
 return Response.json({ok:true},{headers:{"cache-control":"no-store","set-cookie":`${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`}});
}

