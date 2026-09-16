"use client";import {useEffect} from "react";
export default function AnalyticsPing({path,event="view"}:{path:string;event?:string}){useEffect(()=>{fetch("/api/analytics",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({path,event})}).catch(()=>{})},[path,event]);return null}
