import { env } from "cloudflare:workers";

export type ContentRow = { id:number; slug:string; title:string; description:string; version?:string|null; edition?:string|null; address?:string|null; port?:string|null; image_url?:string|null; file_url?:string|null; media_url?:string|null; media_type?:string|null; gallery?:string|null; status?:string|null; owner_name?:string|null; contact?:string|null; payment_note?:string|null; payment_sender?:string|null; payment_amount?:number|null; duration_days?:number|null; private_note?:string|null; created_at:string };
const allowed = new Set(["mods", "journals", "servers"]);

export async function getDbRows(table:string, approvedOnly=false):Promise<ContentRow[]> {
  if (!allowed.has(table) || !env.DB) return [];
  try {
    const where = approvedOnly ? " WHERE status = 'approved'" : "";
    const result = await env.DB.prepare(`SELECT * FROM ${table}${where} ORDER BY created_at DESC`).all<ContentRow>();
    return result.results;
  } catch { return []; }
}

export async function getSettings():Promise<Record<string,string>> {if(!env.DB)return{};try{const r=await env.DB.prepare("SELECT key,value FROM settings").all<{key:string,value:string}>();return Object.fromEntries(r.results.map(x=>[x.key,x.value]))}catch{return{}}}

export function makeSlug(title:string) {
  return `${title.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g,"i").replace(/ğ/g,"g").replace(/ş/g,"s").replace(/ç/g,"c").replace(/ö/g,"o").replace(/ü/g,"u").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}-${Date.now().toString(36)}`;
}

export async function upload(file:File|null, folder:string) {
  if (!file || !env.BUCKET || file.size===0) return null;
  const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");
  const key=`${folder}/${crypto.randomUUID()}-${safe}`;
  await env.BUCKET.put(key, await file.arrayBuffer(), {httpMetadata:{contentType:file.type||"application/octet-stream",contentDisposition:`attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`}});
  return `/api/files/${encodeURIComponent(key)}?name=${encodeURIComponent(file.name)}`;
}
