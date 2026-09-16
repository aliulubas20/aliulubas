"use client";
import {useState} from "react";
export default function Login(){
 const[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function login(e:React.FormEvent<HTMLFormElement>){
 e.preventDefault();const form=e.currentTarget;setBusy(true);setError("");
 try{const r=await fetch("/api/admin/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({password:new FormData(form).get("password")})});const j=await r.json();if(r.ok)location.assign("/admin");else setError(j.error||"Giriş yapılamadı.");}catch{setError("Bağlantı kurulamadı. Yeniden dene.");}finally{setBusy(false)}
 }
 return <main className="mx-auto max-w-lg px-5 py-16"><a href="/" className="eyebrow">← ANA SAYFA</a><section className="admin-box mt-7 p-7"><h1 className="text-3xl font-black">Yönetici girişi</h1><p className="mt-3 text-zinc-400">Site yönetim şifrenle giriş yap.</p><form onSubmit={login} className="mt-6 grid gap-5"><label>Şifre<input name="password" type="password" autoComplete="current-password" required maxLength={128} className="admin-input"/></label><button className="admin-primary" disabled={busy}>{busy?"Giriş yapılıyor…":"Giriş yap"}</button>{error&&<p role="alert" className="text-red-300">{error}</p>}</form></section></main>
}

