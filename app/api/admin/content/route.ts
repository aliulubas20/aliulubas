import{env}from"cloudflare:workers";
import{getAdmin}from"@/lib/admin-auth";import{sameOrigin}from"@/lib/admin-crypto";
import{makeSlug,upload}from"@/lib/content";
import{NextResponse}from"next/server";

const settingKeys=["payment_iban","payment_recipient","server_ad_price","payment_instructions","site_name","hero_title","site_description","youtube","tiktok","instagram","contact_email","about_title","about_content","privacy_title","privacy_content","contact_title","contact_content","seo_title","seo_description","seo_keywords","adsense_enabled","adsense_code","adsense_client","adsense_home_slot","adsense_list_slot","adsense_detail_slot","adsense_format","adsense_auto_ads","custom_css"];

export async function POST(req:Request){if(!sameOrigin(req))return NextResponse.json({error:"Geçersiz istek"},{status:403});if(!await getAdmin())return NextResponse.json({error:"Yetkisiz"},{status:401});
if(!env.DB)return NextResponse.json({error:"Veritabanı bağlı değil"},{status:503});
const f=await req.formData(),section=String(f.get("section"));
if(section==="settings"){for(const key of settingKeys)if(f.has(key))await env.DB.prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(key,String(f.get(key)||"")).run();
return NextResponse.json({ok:true})}if(!["mods","journals","servers"].includes(section))return NextResponse.json({error:"Geçersiz bölüm"},{status:400});
const title=String(f.get("title")||"").trim(),description=String(f.get("description")||"").trim();
if(!title||!description)return NextResponse.json({error:"Başlık ve açıklama zorunlu"},{status:400});
const image=await upload(f.get("image")as File,section),slug=makeSlug(title);
if(section==="mods"){const file=await upload(f.get("download")as File,"downloads");
if(!file)return NextResponse.json({error:"Mod dosyası zorunlu"},{status:400});
await env.DB.prepare("INSERT INTO mods (slug,title,description,version,image_url,file_url) VALUES (?,?,?,?,?,?)").bind(slug,title,description,String(f.get("version")||""),image,file).run()}else if(section==="journals"){const input=f.get("image")as File;
await env.DB.prepare("INSERT INTO journals (slug,title,description,media_url,media_type) VALUES (?,?,?,?,?)").bind(slug,title,description,image,input?.type?.startsWith("video/")?"video":"image").run()}else{const gallery=f.getAll("gallery").filter(x=>x instanceof File)as File[];
if(gallery.length>5)return NextResponse.json({error:"En fazla 5 görsel seçebilirsin"},{status:400});
const urls=await Promise.all(gallery.map(x=>upload(x,"server-gallery")));
const status=f.get("featured")==="true"?"featured":"approved";
if(status==="featured")await env.DB.prepare("DELETE FROM servers WHERE status='featured'").run();
await env.DB.prepare("INSERT INTO servers (slug,title,description,version,edition,address,port,image_url,gallery,status) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(slug,title,description,String(f.get("version")||""),String(f.get("edition")||""),String(f.get("address")||""),String(f.get("port")||""),image,JSON.stringify(urls.filter(Boolean)),status).run()}return NextResponse.json({ok:true,slug})}
export async function PATCH(req:Request){if(!sameOrigin(req))return NextResponse.json({error:"Geçersiz istek"},{status:403});if(!await getAdmin())return NextResponse.json({error:"Yetkisiz"},{status:401});
const{id,section,op}=await req.json();
if(!["mods","journals","servers"].includes(section))return NextResponse.json({error:"Geçersiz bölüm"},{status:400});
if(op==="approve"&&section==="servers")await env.DB.prepare("UPDATE servers SET status='approved' WHERE id=?").bind(id).run();
else if(op==="delete")await env.DB.prepare(`DELETE FROM ${section} WHERE id=?`).bind(id).run();
else return NextResponse.json({error:"Geçersiz işlem"},{status:400});
return NextResponse.json({ok:true})}
