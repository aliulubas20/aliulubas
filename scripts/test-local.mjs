import assert from "node:assert/strict";
import {spawn,spawnSync} from "node:child_process";
import {setTimeout as pause} from "node:timers/promises";

// Uses only the isolated LOCAL D1/R2 state; never contacts a live site.
const result=spawnSync(process.execPath,["scripts/create-admin.mjs","--local"],{encoding:"utf8"});
assert.equal(result.status,0);
const password=result.stdout.split("\n").find(x=>/^[\w-]{43}$/.test(x));
assert.ok(password);
const server=spawn(process.execPath,["node_modules/wrangler/bin/wrangler.js","dev","--local","--port","8793","--ip","127.0.0.1","--inspector-port","0"],{stdio:["ignore","pipe","pipe"],env:{...process.env,CLOUDFLARE_CF_FETCH_ENABLED:"false",WRANGLER_SEND_METRICS:"false"}});
let logs="";server.stdout.on("data",x=>logs+=x);server.stderr.on("data",x=>logs+=x);
const base="http://127.0.0.1:8793";
const json=(body,extra={})=>({method:"POST",headers:{"content-type":"application/json",origin:base,...extra},body:JSON.stringify(body)});
try{
 let ready=false;for(let i=0;i<60;i++){try{const r=await fetch(base+"/admin");if(r.ok){ready=true;break}}catch{}await pause(500);}
 assert.ok(ready,"Local server did not start: "+logs);
 for(const route of ["/","/iletisim.html","/hakkimizda.html","/gizlilik-politikasi.html","/modlar","/sunucular"]){assert.equal((await fetch(base+route)).status,200,route);}
 const page=await(await fetch(base+"/admin")).text();assert.match(page,/Yönetici girişi/);
 let r=await fetch(base+"/api/admin/content",{method:"POST",headers:{origin:base,"oai-authenticated-user-id":"forged","oai-authenticated-user-email":"fake@example.com"},body:new FormData()});assert.equal(r.status,401,"Old identity headers must not authorize");
 r=await fetch(base+"/api/admin/login",json({password},{origin:"https://evil.example"}));assert.equal(r.status,403);
 r=await fetch(base+"/api/admin/login",json({password:"wrong"}));assert.equal(r.status,401);
 r=await fetch(base+"/api/admin/login",json({password}));assert.equal(r.status,200,await r.text());
 const setCookie=r.headers.get("set-cookie");assert.match(setCookie,/HttpOnly/);assert.match(setCookie,/Secure/);assert.match(setCookie,/SameSite=Strict/);
 const cookie=setCookie.split(";")[0],auth={origin:base,cookie};
 assert.match(await(await fetch(base+"/admin",{headers:{cookie}})).text(),/Admin Paneli/);
 const settings=new FormData();settings.set("section","settings");settings.set("contact_title","Yerel test iletişim");
 r=await fetch(base+"/api/admin/content",{method:"POST",headers:auth,body:settings});assert.equal(r.status,200);
 assert.match(await(await fetch(base+"/iletisim.html")).text(),/Yerel test iletişim/);
 r=await fetch(base+"/api/admin/content",{method:"POST",headers:{...auth,origin:"https://evil.example"},body:settings});assert.equal(r.status,403);
 const mod=new FormData();mod.set("section","mods");mod.set("title","Yerel test modu");mod.set("description","Yerel yükleme testi");mod.set("version","1.26");
 mod.set("image",new Blob([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jF1sAAAAASUVORK5CYII=","base64")],{type:"image/png"}),"test.png");
 mod.set("download",new Blob(["test-mod-bytes"],{type:"application/zip"}),"test.mcpack");
 r=await fetch(base+"/api/admin/content",{method:"POST",headers:auth,body:mod});assert.equal(r.status,200);
 const saved=await r.json();assert.ok(saved.slug);
 const detail=await(await fetch(base+"/mods/"+saved.slug)).text();assert.match(detail,/Yerel test modu/);
 const file=detail.match(/href="([^"]*api\/files[^"]*downloads[^"]*)"/);assert.ok(file,"Download link must exist");
 const downloaded=await fetch(base+file[1].replaceAll("&amp;","&"));assert.equal(downloaded.status,200);assert.equal(await downloaded.text(),"test-mod-bytes");
 r=await fetch(base+"/api/admin/logout",{method:"POST",headers:auth,redirect:"manual"});assert.equal(r.status,303);
 r=await fetch(base+"/api/admin/content",{method:"POST",headers:auth,body:settings});assert.equal(r.status,401,"Logout must revoke session");
 let blocked=false;for(let i=0;i<11;i++){r=await fetch(base+"/api/admin/login",json({password:"bad"}));if(r.status===429){blocked=true;break}}assert.ok(blocked,"Login attempts must be rate limited");
 console.log("PASS: public pages, login, forged identity rejection, origin checks, settings persistence, R2 upload/download, logout revocation, rate limit.");
}finally{server.kill("SIGTERM");}
