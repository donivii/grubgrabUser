import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ============================================================
// GRUBGRAB v2 - Private Managed Deal Network
// ============================================================

const BRAND = {
  primary: "#FF4500", primaryDark: "#CC3700",
  secondary: "#FFD700", secondaryDark: "#E6C200",
  bg: "#FFFFFF", bgSoft: "#FFF8F0", bgCard: "#FFFAF5",
  text: "#1A1A1A", textMuted: "#555555", textLight: "#888888",
  danger: "#DC3545", success: "#28A745", border: "#F0E8E0",
  purple: "#9C27B0", purpleLight: "#E040FB",
};
const FH = "'Nunito', sans-serif";
const FB = "'Nunito', sans-serif";
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const CATEGORIES = ["Restaurant","Bar & Lounge","Café","Fast Food","Fine Dining","Pub & Grill"];
const CUISINES = ["All Cuisines","South African","Italian","Japanese","Mexican","Indian","American","Mediterranean","Asian Fusion","Steakhouse","Seafood","Drinks & Cocktails","Craft Beer","Wine Bar"];
const DEAL_CATS = ["Food Special","Happy Hour","Drinks Special","Cocktail Hour","Combo Deal","Lunch Special","Dinner Special","Breakfast Deal","Wine Deal","Craft Beer Deal"];


// --- Supabase Config ---
const SUPABASE_URL = "https://knvtpozpwousyjuwnczx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudnRwb3pwd291c3lqdXduY3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0MzE4NTEsImV4cCI6MjEwMDAwNzg1MX0.NWM-K34KXqzjddUeNej_UQ1FfGQKWJUbRZK4CAXoEaA";
const sbHeaders = {"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json"};
const sbFetch = async (table,opts={})=>{
  const {method="GET",body,query=""}=opts;
  const url=`${SUPABASE_URL}/rest/v1/${table}${query}`;
  const config={method,headers:sbHeaders};
  if(body)config.body=JSON.stringify(body);
  const res=await fetch(url,config);
  if(!res.ok)throw new Error(`Supabase error: ${res.status}`);
  if(method==="DELETE"||res.status===204)return null;
  return res.json();
};

const SEED_R = [
  { id:"r1", name:"Marble Restaurant", address:"Trumpet on Keyes, Rosebank", lat:-26.1460, lng:28.0436, category:"Fine Dining", cuisine:"South African", contact:"011 594 5550", active:true, delivery:false },
  { id:"r2", name:"Che Argentine Grill", address:"Cnr Maude & 5th, Sandton", lat:-26.1076, lng:28.0567, category:"Restaurant", cuisine:"Steakhouse", contact:"011 784 3622", active:true, delivery:true },
  { id:"r3", name:"Craft Brauhaus", address:"Shop 12, Melrose Arch", lat:-26.1340, lng:28.0690, category:"Pub & Grill", cuisine:"Craft Beer", contact:"011 684 1532", active:true, delivery:false },
  { id:"r4", name:"Sakura Japanese", address:"Nelson Mandela Square, Sandton", lat:-26.1070, lng:28.0530, category:"Restaurant", cuisine:"Japanese", contact:"011 883 4488", active:true, delivery:true },
  { id:"r5", name:"The Grillhouse", address:"The Firs, Rosebank", lat:-26.1480, lng:28.0410, category:"Restaurant", cuisine:"Steakhouse", contact:"011 880 3945", active:true, delivery:true },
  { id:"r6", name:"Trumps Grillhouse", address:"Sandton Sun Hotel", lat:-26.1055, lng:28.0570, category:"Fine Dining", cuisine:"Drinks & Cocktails", contact:"011 780 5320", active:true, delivery:false },
  { id:"r7", name:"Voodoo Lily Café", address:"44 Stanley, Milpark", lat:-26.1870, lng:28.0170, category:"Café", cuisine:"Mediterranean", contact:"011 482 5485", active:true, delivery:true },
  { id:"r8", name:"The Local Grill", address:"Parktown North", lat:-26.1560, lng:28.0290, category:"Pub & Grill", cuisine:"South African", contact:"011 447 5802", active:true, delivery:true },
  { id:"r9", name:"Sin + Tax Bar", address:"Arts on Main, Maboneng", lat:-26.2020, lng:28.0560, category:"Bar & Lounge", cuisine:"Craft Beer", contact:"011 334 0813", active:true, delivery:false },
  { id:"r10", name:"The Botanist Gin Bar", address:"Braamfontein", lat:-26.1930, lng:28.0360, category:"Bar & Lounge", cuisine:"Drinks & Cocktails", contact:"076 255 4190", active:true, delivery:false },
];

const SEED_D = [
  { id:"d1", restaurantId:"r1", title:"Half-Price Wine Wednesdays", description:"50% off all wines by the glass — perfect for after-work wind-down with friends", category:"Wine Deal", days:["Wednesday"], startTime:"17:00", endTime:"20:00", expiryDate:"2026-12-31", active:true },
  { id:"d2", restaurantId:"r1", title:"3-Course Lunch Special", description:"Starter, main & dessert for R299. Chef's selection changes weekly", category:"Lunch Special", days:["Monday","Tuesday","Wednesday","Thursday","Friday"], startTime:"11:30", endTime:"14:30", expiryDate:"2026-06-30", active:true },
  { id:"d3", restaurantId:"r2", title:"Steak & Malbec Monday", description:"300g sirloin + glass of Malbec R189. Upgrade to 500g for R50 extra", category:"Food Special", days:["Monday"], startTime:"12:00", endTime:"22:00", expiryDate:"2026-12-31", active:true },
  { id:"d4", restaurantId:"r3", title:"Happy Hour Craft Beers", description:"All craft beers buy 2 get 1 free. Over 12 taps rotating weekly", category:"Craft Beer Deal", days:["Thursday","Friday"], startTime:"16:00", endTime:"19:00", expiryDate:"2026-12-31", active:true },
  { id:"d5", restaurantId:"r3", title:"Burger & Brew Combo", description:"Any gourmet burger + craft beer of your choice for only R129", category:"Combo Deal", days:["Monday","Tuesday","Wednesday"], startTime:"11:00", endTime:"15:00", expiryDate:"2026-09-30", active:true },
  { id:"d6", restaurantId:"r4", title:"Sushi Train Lunch", description:"All-you-can-eat sushi train R199pp. Includes miso soup starter", category:"Lunch Special", days:["Monday","Tuesday","Wednesday","Thursday","Friday"], startTime:"12:00", endTime:"14:30", expiryDate:"2026-12-31", active:true },
  { id:"d7", restaurantId:"r5", title:"Rib & Wing Wednesday", description:"500g ribs + 6 wings for R175. Add a side of onion rings for R25", category:"Food Special", days:["Wednesday"], startTime:"17:00", endTime:"22:00", expiryDate:"2026-12-31", active:true },
  { id:"d8", restaurantId:"r6", title:"Sunset Cocktail Hour", description:"All signature cocktails R55 each. Live jazz on the terrace", category:"Cocktail Hour", days:["Friday","Saturday"], startTime:"16:00", endTime:"18:00", expiryDate:"2026-12-31", active:true },
  { id:"d9", restaurantId:"r7", title:"Breakfast for Two", description:"2 full breakfasts + 2 coffees R189. Available on the patio", category:"Breakfast Deal", days:["Saturday","Sunday"], startTime:"08:00", endTime:"11:30", expiryDate:"2026-12-31", active:true },
  { id:"d10", restaurantId:"r8", title:"Thursday Burger Night", description:"Any gourmet burger R89 (normally R145). Including the famous biltong burger", category:"Food Special", days:["Thursday"], startTime:"17:00", endTime:"21:00", expiryDate:"2026-12-31", active:true },
  { id:"d11", restaurantId:"r8", title:"Sunday Roast Special", description:"Traditional roast + sides + dessert R169. Lamb, beef or chicken", category:"Dinner Special", days:["Sunday"], startTime:"12:00", endTime:"16:00", expiryDate:"2026-12-31", active:true },
  { id:"d12", restaurantId:"r5", title:"Weekday Lunch Express", description:"Main + side + drink R139. Served in 30 min or it's free", category:"Lunch Special", days:["Monday","Tuesday","Wednesday","Thursday","Friday"], startTime:"11:30", endTime:"14:00", expiryDate:"2026-04-15", active:true },
  { id:"d13", restaurantId:"r9", title:"Craft Tasting Fridays", description:"5 craft beer tasters + cheese board for R99. Meet the brewers", category:"Craft Beer Deal", days:["Friday"], startTime:"15:00", endTime:"19:00", expiryDate:"2026-12-31", active:true },
  { id:"d14", restaurantId:"r10", title:"Gin O'Clock Thursdays", description:"All double gins R65 (normally R95). Over 40 gins available", category:"Drinks Special", days:["Thursday"], startTime:"16:00", endTime:"20:00", expiryDate:"2026-12-31", active:true },
  { id:"d15", restaurantId:"r10", title:"Saturday Spritz Special", description:"Aperol Spritz R55 all day long. DJ sets from 4pm", category:"Cocktail Hour", days:["Saturday"], startTime:"11:00", endTime:"22:00", expiryDate:"2026-12-31", active:true },
  { id:"d16", restaurantId:"r6", title:"Whisky Wednesday", description:"All premium whiskies 30% off. Tasting flight available for R120", category:"Drinks Special", days:["Wednesday"], startTime:"17:00", endTime:"21:00", expiryDate:"2026-12-31", active:true },
];

// --- Utilities ---
const hDist = (a,b,c,d) => { const R=6371,dL=((c-a)*Math.PI)/180,dN=((d-b)*Math.PI)/180,x=Math.sin(dL/2)**2+Math.cos((a*Math.PI)/180)*Math.cos((c*Math.PI)/180)*Math.sin(dN/2)**2; return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)); };
const tMin = (t) => { const [h,m]=t.split(":").map(Number); return h*60+m; };
const fTime = (t) => { const [h,m]=t.split(":").map(Number); return `${h%12||12}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`; };
const nowMin = () => { const n=new Date(); return n.getHours()*60+n.getMinutes(); };
const today = () => DAYS[new Date().getDay()];

const isActive = (d) => d.active && d.days.includes(today()) && nowMin()>=tMin(d.startTime) && nowMin()<=tMin(d.endTime) && new Date(d.expiryDate)>=new Date();
const isUpcoming = (d) => d.active && d.days.includes(today()) && nowMin()<tMin(d.startTime) && new Date(d.expiryDate)>=new Date();
const timeLeft = (end) => { const d=tMin(end)-nowMin(); if(d<=0)return null; const h=Math.floor(d/60),m=d%60; return h>0?`${h}h ${m}m`:`${m}m`; };
const timeUntil = (start) => { const d=tMin(start)-nowMin(); if(d<=0)return null; const h=Math.floor(d/60),m=d%60; return h>0?`${h}h ${m}m`:`${m}m`; };
const daysUntilExpiry = (exp) => Math.ceil((new Date(exp)-new Date())/(1000*60*60*24));
const genId = () => Math.random().toString(36).substr(2,9);
const isDrink = (cat) => ["Craft Beer Deal","Wine Deal","Drinks Special","Cocktail Hour","Happy Hour"].includes(cat);
const dealEmoji = (c) => ({"Food Special":"🍖","Happy Hour":"🍻","Drinks Special":"🍹","Cocktail Hour":"🍸","Combo Deal":"🍔","Lunch Special":"☀️","Dinner Special":"🌙","Breakfast Deal":"🌅","Wine Deal":"🍷","Craft Beer Deal":"🍺"}[c]||"🏷️");
const cuisineEmoji = (c) => ({"South African":"🇿🇦","Italian":"🍝","Japanese":"🍣","Mexican":"🌮","Indian":"🍛","American":"🍔","Mediterranean":"🫒","Asian Fusion":"🥢","Steakhouse":"🥩","Seafood":"🦐","Drinks & Cocktails":"🍸","Craft Beer":"🍺","Wine Bar":"🍷"}[c]||"🍽️");

// Highlight Rand prices in text — extracts first price to the front
const PriceText = ({text,size=13}) => {
  const priceMatch=text.match(/R\d[\d,.\s]*\d*/);
  if(!priceMatch)return <span>{text}</span>;
  const price=priceMatch[0].trim();
  const rest=text.replace(priceMatch[0],"").replace(/^\s*[.\-–—:]\s*/,"").replace(/\s{2,}/g," ").trim();
  return <span><span style={{fontWeight:900,fontSize:size*1.35,color:BRAND.primary,fontFamily:FH,marginRight:6}}>{price}</span>{rest}</span>;
};

// load/save now handled by Supabase (except favorites which stay local)
const loadFavs = () => { try { const f=localStorage.getItem("gg-favs"); return f?JSON.parse(f):[]; } catch { return []; } };
const saveFavs = (f) => { try { localStorage.setItem("gg-favs",JSON.stringify(f)); } catch {} };

// ============================================================
// SHARED COMPONENTS
// ============================================================

const LOGO_URL = "data:image/png;base64,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";

const Logo = ({size=32,showText=true}) => (
  <div style={{display:"flex",alignItems:"center",gap:8}}>
    <img src={LOGO_URL} alt="GrubGrab" style={{width:size*1.2,height:size*1.2,borderRadius:size*0.25,objectFit:"cover"}}/>
    {showText&&<span style={{fontFamily:FH,fontWeight:900,fontSize:size*0.6,background:`linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>GrubGrab</span>}
  </div>
);

// Modal wrapper
const Modal = ({open,onClose,children,title}) => {
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}} role="dialog" aria-modal="true" aria-label={title}>
      <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:520,maxHeight:"85vh",overflow:"auto",animation:"slideUp 0.3s ease",padding:0}}>
        <div style={{position:"sticky",top:0,background:"white",padding:"16px 20px 8px",borderBottom:`1px solid ${BRAND.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:10,borderRadius:"24px 24px 0 0"}}>
          <h2 style={{margin:0,fontFamily:FH,fontWeight:800,fontSize:18,color:BRAND.text}}>{title}</h2>
          <button onClick={onClose} aria-label="Close" style={{width:32,height:32,borderRadius:"50%",border:"none",background:BRAND.bgSoft,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:BRAND.textMuted}}>✕</button>
        </div>
        <div style={{padding:"12px 20px 24px"}}>{children}</div>
      </div>
    </div>
  );
};

// Badge
const Badge = ({children,color=BRAND.primary,bg}) => (
  <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:color,background:bg||`${color}12`,padding:"3px 8px",borderRadius:8,fontFamily:FB,display:"inline-flex",alignItems:"center",gap:3,whiteSpace:"nowrap"}}>{children}</span>
);

// Countdown
const Countdown = ({endTime,isUp,startTime}) => {
  const [,tick]=useState(0);
  useEffect(()=>{const i=setInterval(()=>tick(t=>t+1),15000);return()=>clearInterval(i);},[]);
  if(isUp){const t=timeUntil(startTime);return t?<Badge color={BRAND.secondaryDark} bg={`${BRAND.secondary}30`}>⏳ Starts in {t}</Badge>:null;}
  const t=timeLeft(endTime);
  if(!t)return null;
  const urgent=tMin(endTime)-nowMin()<60;
  return <Badge color={urgent?BRAND.danger:BRAND.success} bg={urgent?`${BRAND.danger}12`:`${BRAND.success}12`}><span style={{animation:urgent?"pulse 1.5s infinite":"none"}}>🔥 {t} left</span></Badge>;
};

// Expiry warning
const ExpiryBadge = ({expiryDate}) => {
  const d=daysUntilExpiry(expiryDate);
  if(d>14) return null;
  if(d<=0) return <Badge color={BRAND.danger}>Expired</Badge>;
  if(d<=3) return <Badge color={BRAND.danger}>⚠️ Ends in {d}d</Badge>;
  return <Badge color={BRAND.secondaryDark} bg={`${BRAND.secondary}20`}>📅 {d} days left</Badge>;
};

// Fav button
const FavButton = ({isFav,onToggle,size=20}) => (
  <button onClick={e=>{e.stopPropagation();onToggle();}} aria-label={isFav?"Remove from favorites":"Add to favorites"} style={{width:size+12,height:size+12,borderRadius:"50%",border:"none",background:isFav?`${BRAND.danger}12`:"transparent",cursor:"pointer",fontSize:size,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",padding:0}}>
    {isFav?"❤️":"🤍"}
  </button>
);

// ============================================================
// ONBOARDING
// ============================================================
const Onboarding = ({onComplete}) => {
  const [step,setStep]=useState(0);
  const [locStatus,setLocStatus]=useState("idle"); // idle|asking|granted|denied

  const requestLocation = () => {
    setLocStatus("asking");
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        (pos)=>{setLocStatus("granted");onComplete(pos.coords.latitude,pos.coords.longitude);},
        ()=>setLocStatus("denied"),
        {enableHighAccuracy:true,timeout:10000}
      );
    } else setLocStatus("denied");
  };

  const steps = [
    // Welcome
    <div key={0} style={{textAlign:"center",padding:"40px 20px"}}>
      <div style={{marginBottom:16,animation:"bounce 1s ease infinite",display:"flex",justifyContent:"center"}}><img src={LOGO_URL} alt="GrubGrab" style={{width:100,height:100,borderRadius:20,objectFit:"cover"}}/></div>
      <h1 style={{fontFamily:FH,fontWeight:900,fontSize:28,color:BRAND.text,margin:"0 0 8px",lineHeight:1.2}}>
        Welcome to <span style={{color:BRAND.primary}}>GrubGrab</span>
      </h1>
      <p style={{color:BRAND.textMuted,fontSize:16,lineHeight:1.5,margin:"0 0 32px",fontFamily:FB}}>
        Discover food specials, happy hours & drink deals happening near you — right now.
      </p>
      <button onClick={()=>setStep(1)} style={{padding:"14px 40px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`,color:"white",fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:FH,boxShadow:`0 4px 20px ${BRAND.primary}40`}}>
        Let's Go →
      </button>
    </div>,
    // How it works
    <div key={1} style={{textAlign:"center",padding:"30px 20px"}}>
      <h2 style={{fontFamily:FH,fontWeight:800,fontSize:22,color:BRAND.text,margin:"0 0 24px"}}>How It Works</h2>
      <div style={{display:"flex",flexDirection:"column",gap:16,textAlign:"left",maxWidth:300,margin:"0 auto"}}>
        {[
          {icon:"📍",title:"Search nearby",desc:"Find deals within walking or driving distance"},
          {icon:"🔥",title:"See what's live",desc:"Active deals happening right now, with countdowns"},
          {icon:"📅",title:"Plan your week",desc:"Browse the calendar to find the best days"},
          {icon:"❤️",title:"Save favorites",desc:"Heart the deals you love for quick access"},
        ].map((item,i)=>(
          <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{fontSize:24,width:40,height:40,borderRadius:12,background:BRAND.bgSoft,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{item.icon}</div>
            <div>
              <div style={{fontWeight:700,color:BRAND.text,fontFamily:FB,fontSize:14}}>{item.title}</div>
              <div style={{color:BRAND.textMuted,fontSize:13,fontFamily:FB}}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={()=>setStep(2)} style={{marginTop:28,padding:"14px 40px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`,color:"white",fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:FH,boxShadow:`0 4px 20px ${BRAND.primary}40`}}>
        Enable Location →
      </button>
    </div>,
    // Location permission
    <div key={2} style={{textAlign:"center",padding:"30px 20px"}}>
      <div style={{fontSize:56,marginBottom:16}}>📍</div>
      <h2 style={{fontFamily:FH,fontWeight:800,fontSize:22,color:BRAND.text,margin:"0 0 8px"}}>Find Deals Near You</h2>
      <p style={{color:BRAND.textMuted,fontSize:14,margin:"0 0 24px",fontFamily:FB,lineHeight:1.5}}>
        We need your location to show deals nearby. Your location is never stored or shared.
      </p>
      {locStatus==="idle" && <button onClick={requestLocation} style={{padding:"14px 40px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`,color:"white",fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:FH,boxShadow:`0 4px 20px ${BRAND.primary}40`,width:"100%",maxWidth:300}}>Allow Location Access</button>}
      {locStatus==="asking" && <div style={{color:BRAND.textMuted,fontFamily:FB,fontSize:14}}>📡 Requesting location...</div>}
      {locStatus==="denied" && (
        <div>
          <div style={{background:`${BRAND.secondary}15`,borderRadius:12,padding:16,marginBottom:16}}>
            <p style={{color:BRAND.text,fontFamily:FB,fontSize:14,margin:0}}>No worries! We've set your location to <strong>Rosebank, Johannesburg</strong>. You can search from there.</p>
          </div>
          <button onClick={()=>onComplete(-26.1460,28.0436)} style={{padding:"14px 40px",borderRadius:14,border:"none",background:`linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`,color:"white",fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:FH,boxShadow:`0 4px 20px ${BRAND.primary}40`}}>Continue Anyway →</button>
        </div>
      )}
    </div>,
  ];

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(180deg,${BRAND.bgSoft} 0%,white 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:FB}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{width:"100%",maxWidth:400,animation:"slideUp 0.4s ease"}}>
        {steps[step]}
        {/* Progress dots */}
        <div style={{display:"flex",justifyContent:"center",gap:8,paddingTop:20}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{width:i===step?24:8,height:8,borderRadius:4,background:i===step?BRAND.primary:`${BRAND.primary}25`,transition:"all 0.3s"}} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAP (Leaflet + OpenStreetMap)
// ============================================================
const MapView = ({deals,restaurants,userLat,userLng,radius,onTapRestaurant}) => {
  const mapRef=useRef(null);
  const mapInstance=useRef(null);
  const markersRef=useRef([]);
  const circleRef=useRef(null);
  const userMarkerRef=useRef(null);

  const rMap=useMemo(()=>{const m={};restaurants.forEach(r=>m[r.id]=r);return m;},[restaurants]);
  const pins=useMemo(()=>{
    const g={};
    deals.forEach(d=>{const r=rMap[d.restaurantId];if(!r)return;if(!g[r.id])g[r.id]={restaurant:r,deals:[],dist:hDist(userLat,userLng,r.lat,r.lng)};g[r.id].deals.push(d);});
    return Object.values(g);
  },[deals,rMap,userLat,userLng]);

  // Load Leaflet CSS + JS once
  useEffect(()=>{
    if(document.getElementById("leaflet-css"))return;
    const css=document.createElement("link");
    css.id="leaflet-css";css.rel="stylesheet";
    css.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(css);
    const js=document.createElement("script");
    js.id="leaflet-js";
    js.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    document.head.appendChild(js);
  },[]);

  // Initialize map
  useEffect(()=>{
    const init=()=>{
      if(!window.L||!mapRef.current)return;
      if(mapInstance.current){mapInstance.current.remove();mapInstance.current=null;}

      const map=window.L.map(mapRef.current,{zoomControl:false,attributionControl:false}).setView([userLat,userLng],13);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(map);
      window.L.control.zoom({position:"bottomright"}).addTo(map);
      window.L.control.attribution({position:"bottomleft",prefix:false}).addTo(map).addAttribution('© <a href="https://openstreetmap.org">OSM</a>');

      mapInstance.current=map;
      // Small delay to fix tile rendering in artifacts
      setTimeout(()=>map.invalidateSize(),200);
    };

    if(window.L){init();}
    else{const check=setInterval(()=>{if(window.L){clearInterval(check);init();}},100);return()=>clearInterval(check);}
  },[]);

  // Update user marker, radius circle, and restaurant markers
  useEffect(()=>{
    const map=mapInstance.current;
    if(!map||!window.L)return;

    // Update view
    map.setView([userLat,userLng],radius<=5?14:radius<=10?13:12);

    // User marker
    if(userMarkerRef.current)map.removeLayer(userMarkerRef.current);
    const userIcon=window.L.divIcon({
      className:"",
      html:`<div style="width:20px;height:20px;border-radius:50%;background:${BRAND.primary};border:3px solid white;box-shadow:0 2px 8px rgba(255,69,0,0.6);animation:pulseGlow 2s infinite"></div>`,
      iconSize:[20,20],iconAnchor:[10,10]
    });
    userMarkerRef.current=window.L.marker([userLat,userLng],{icon:userIcon,zIndexOffset:1000}).addTo(map);
    userMarkerRef.current.bindPopup(`<div style="font-family:Nunito,sans-serif;font-weight:700;font-size:13px;text-align:center;padding:2px">📍 You are here</div>`,{closeButton:false,className:"grubgrab-popup"});

    // Radius circle
    if(circleRef.current)map.removeLayer(circleRef.current);
    circleRef.current=window.L.circle([userLat,userLng],{radius:radius*1000,color:BRAND.primary,fillColor:BRAND.primary,fillOpacity:0.06,weight:2,dashArray:"8,6",opacity:0.4}).addTo(map);

    // Restaurant markers
    markersRef.current.forEach(m=>map.removeLayer(m));
    markersRef.current=[];

    pins.forEach(p=>{
      const r=p.restaurant;
      const dealCount=p.deals.length;
      const hasDrinks=p.deals.some(d=>isDrink(d.category));
      const pinColor=hasDrinks?BRAND.purple:BRAND.primary;

      const icon=window.L.divIcon({
        className:"",
        html:`<div style="position:relative;width:32px;height:40px;cursor:pointer">
          <div style="width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${pinColor};border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
            <span style="transform:rotate(45deg);font-size:14px">${hasDrinks?"🍹":"🍽️"}</span>
          </div>
          <div style="position:absolute;top:-8px;right:-8px;background:${BRAND.secondary};color:${BRAND.text};font-size:10px;font-weight:800;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1.5px solid white;font-family:Nunito,sans-serif">${dealCount}</div>
        </div>`,
        iconSize:[32,40],iconAnchor:[16,40],popupAnchor:[0,-36]
      });

      const marker=window.L.marker([r.lat,r.lng],{icon}).addTo(map);
      
      const popupHtml=`
        <div style="font-family:Nunito,sans-serif;min-width:160px;padding:4px">
          <div style="font-weight:800;font-size:14px;color:#1A1A1A;margin-bottom:3px">${r.name}</div>
          <div style="font-size:12px;color:#555;margin-bottom:2px">${cuisineEmoji(r.cuisine)} ${r.cuisine} • ${r.category}</div>
          <div style="font-size:12px;color:#555;margin-bottom:4px">📍 ${p.dist.toFixed(1)}km away${r.delivery?" • 🛵 Delivery":""}</div>
          <div style="font-size:12px;font-weight:700;color:${BRAND.primary}">${dealCount} deal${dealCount>1?"s":""} available</div>
          <div style="margin-top:6px;text-align:center">
            <span style="font-size:11px;color:${BRAND.primary};font-weight:700;cursor:pointer">Tap for details →</span>
          </div>
        </div>`;

      marker.bindPopup(popupHtml,{closeButton:false,className:"grubgrab-popup",maxWidth:220});
      marker.on("click",()=>{marker.openPopup();});
      marker.on("popupopen",()=>{
        const popupEl=marker.getPopup().getElement();
        if(popupEl){popupEl.addEventListener("click",()=>{onTapRestaurant&&onTapRestaurant(r);marker.closePopup();});}
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers + user
    if(pins.length>0){
      const allPoints=[[userLat,userLng],...pins.map(p=>[p.restaurant.lat,p.restaurant.lng])];
      map.fitBounds(allPoints,{padding:[40,40],maxZoom:15});
    }

    setTimeout(()=>map.invalidateSize(),100);
  },[userLat,userLng,radius,pins,onTapRestaurant]);

  return (
    <div style={{position:"relative",width:"100%",borderRadius:20,overflow:"hidden",border:`1px solid ${BRAND.border}`,boxShadow:"0 4px 20px rgba(0,0,0,0.06)",zIndex:1}}>
      <style>{`
        .grubgrab-popup .leaflet-popup-content-wrapper{border-radius:14px;box-shadow:0 4px 20px rgba(0,0,0,0.15);padding:4px}
        .grubgrab-popup .leaflet-popup-tip{display:none}
        .grubgrab-popup .leaflet-popup-content{margin:8px 12px}
        .leaflet-control-zoom a{width:32px!important;height:32px!important;line-height:32px!important;border-radius:10px!important;font-size:16px!important;border:1px solid ${BRAND.border}!important;color:${BRAND.text}!important}
        .leaflet-control-zoom{border:none!important;border-radius:12px!important;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)!important}
        .leaflet-pane{z-index:1!important}
        .leaflet-top,.leaflet-bottom{z-index:2!important}
        .leaflet-control{z-index:2!important}
      `}</style>
      <div ref={mapRef} style={{width:"100%",height:280}} role="img" aria-label={`Map showing ${pins.length} locations within ${radius}km`}/>
      <div style={{position:"absolute",top:10,left:10,zIndex:800,background:"rgba(255,255,255,0.94)",backdropFilter:"blur(6px)",padding:"5px 12px",borderRadius:10,fontSize:12,fontWeight:700,color:BRAND.text,fontFamily:FB,boxShadow:"0 2px 8px rgba(0,0,0,0.08)",pointerEvents:"none"}}>
        📍 {radius}km • {pins.length} spot{pins.length!==1?"s":""}
      </div>
    </div>
  );
};

// ============================================================
// WEEKLY CALENDAR
// ============================================================
const WeeklyCalendar = ({deals,restaurants,selectedDay,onSelectDay}) => {
  const now=new Date();
  const rMap=useMemo(()=>{const m={};restaurants.forEach(r=>m[r.id]=r);return m;},[restaurants]);

  const week=useMemo(()=>{
    return Array.from({length:7},(_,i)=>{
      const dt=new Date(now);dt.setDate(dt.getDate()+i);
      const dn=DAYS[dt.getDay()];
      const dd=deals.filter(d=>d.active&&d.days.includes(dn)&&new Date(d.expiryDate)>=now);
      return {date:dt,dayName:dn,short:dn.slice(0,3),num:dt.getDate(),month:dt.toLocaleString("default",{month:"short"}),isToday:i===0,deals:dd,food:dd.filter(d=>!isDrink(d.category)),drinks:dd.filter(d=>isDrink(d.category))};
    });
  },[deals,now]);

  const selData=week.find(w=>w.dayName===selectedDay);
  const maxD=Math.max(...week.map(w=>w.deals.length),1);

  return (
    <div style={{background:"white",borderRadius:20,padding:"14px 12px",border:`1px solid ${BRAND.border}`,marginBottom:12}} role="navigation" aria-label="Weekly deal calendar">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,padding:"0 4px"}}>
        <h3 style={{margin:0,fontFamily:FH,fontWeight:800,fontSize:15,color:BRAND.text}}>📅 This Week</h3>
        {selectedDay!==null&&(
          <button onClick={()=>onSelectDay(null)} style={{background:"none",border:"none",color:BRAND.primary,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:FB}}>Show all ✕</button>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {week.map((day,i)=>{
          const isSel=selectedDay===day.dayName;
          return (
            <button key={i} onClick={()=>onSelectDay(isSel?null:day.dayName)} aria-label={`${day.dayName}, ${day.num} ${day.month} — ${day.deals.length} deals`}
              style={{cursor:"pointer",textAlign:"center",borderRadius:14,padding:"6px 0",border:isSel?`2px solid ${BRAND.primary}`:day.isToday?`2px solid ${BRAND.secondary}`:"2px solid transparent",background:isSel?`${BRAND.primary}08`:"transparent",transition:"all 0.2s"}}>
              <div style={{fontSize:9,fontWeight:700,color:day.isToday?BRAND.primary:BRAND.textLight,fontFamily:FB,textTransform:"uppercase",letterSpacing:0.3}}>{day.short}</div>
              <div style={{fontSize:17,fontWeight:800,color:isSel?BRAND.primary:BRAND.text,fontFamily:FH,margin:"1px 0"}}>{day.num}</div>
              <div style={{fontSize:10,marginTop:3,fontWeight:700,fontFamily:FB,lineHeight:1.4}}>
                {day.food.length>0&&<div style={{color:BRAND.primary}}>🍽️{day.food.length}</div>}
                {day.drinks.length>0&&<div style={{color:BRAND.purple}}>🍹{day.drinks.length}</div>}
                {day.deals.length===0&&<div style={{color:BRAND.textLight}}>—</div>}
              </div>
            </button>
          );
        })}
      </div>
      {selData&&selData.deals.length>0&&(
        <div style={{marginTop:10,borderTop:`1px solid ${BRAND.border}`,paddingTop:10}}>
          <div style={{fontSize:12,fontWeight:700,color:BRAND.text,marginBottom:6,fontFamily:FH}}>
            {selData.isToday?"Today":selData.dayName}, {selData.num} {selData.month} <span style={{fontWeight:400,color:BRAND.textMuted}}>— {selData.deals.length} deal{selData.deals.length!==1?"s":""}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {selData.deals.slice(0,4).map(deal=>{
              const rest=rMap[deal.restaurantId];
              return (
                <div key={deal.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:BRAND.bgSoft,borderRadius:10,fontSize:11,fontFamily:FB}}>
                  <span style={{fontSize:16}}>{dealEmoji(deal.category)}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,color:BRAND.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{deal.title}</div>
                    <div style={{color:BRAND.textMuted,fontSize:10}}>{rest?.name} • {fTime(deal.startTime)}–{fTime(deal.endTime)}</div>
                  </div>
                </div>
              );
            })}
            {selData.deals.length>4&&<div style={{textAlign:"center",fontSize:10,color:BRAND.textMuted,fontFamily:FB,paddingTop:2}}>+{selData.deals.length-4} more</div>}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// DEAL CARD
// ============================================================
const DealCard = ({deal,restaurant,distance,isUp,isFav,onToggleFav,onTap}) => {
  const active=!isUp&&isActive(deal);
  const expDays=daysUntilExpiry(deal.expiryDate);
  return (
    <div onClick={()=>onTap&&onTap(deal)} style={{background:"white",borderRadius:18,padding:"14px 16px",border:`1px solid ${BRAND.border}`,boxShadow:"0 1px 6px rgba(0,0,0,0.04)",cursor:"pointer",position:"relative",overflow:"hidden",transition:"transform 0.15s",fontFamily:FB}} role="article" aria-label={deal.title}>
      
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{fontSize:15}}>{dealEmoji(deal.category)}</span>
            <Badge>{deal.category}</Badge>
            {active&&<Badge color={BRAND.success}>● LIVE</Badge>}
            {expDays<=14&&expDays>0&&<ExpiryBadge expiryDate={deal.expiryDate}/>}
          </div>
          <h3 style={{margin:0,fontSize:15,fontWeight:800,color:BRAND.text,fontFamily:FH,lineHeight:1.3}}>{deal.title}</h3>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
          <FavButton isFav={isFav} onToggle={onToggleFav}/>
          <Countdown endTime={deal.endTime} isUp={isUp} startTime={deal.startTime}/>
        </div>
      </div>
      <p style={{margin:"6px 0 10px",fontSize:13,color:BRAND.textMuted,lineHeight:1.4}}><PriceText text={deal.description} size={13}/></p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:4}}>
        <div style={{display:"flex",alignItems:"center",gap:5,minWidth:0}}>
          <span style={{fontSize:12,fontWeight:700,color:BRAND.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>🏪 {restaurant?.name||"Unknown"}</span>
          {restaurant?.delivery&&<span style={{fontSize:9,fontWeight:700,color:BRAND.success,background:`${BRAND.success}12`,padding:"2px 6px",borderRadius:6,whiteSpace:"nowrap"}}>🛵 Delivery</span>}
          {distance!=null&&<span style={{fontSize:11,color:BRAND.textMuted,whiteSpace:"nowrap"}}>• {distance.toFixed(1)}km</span>}
        </div>
        <span style={{fontSize:11,color:BRAND.textMuted,whiteSpace:"nowrap"}}>🕐 {fTime(deal.startTime)}–{fTime(deal.endTime)}</span>
      </div>
    </div>
  );
};

// ============================================================
// DEAL DETAIL MODAL
// ============================================================
const DealDetail = ({deal,restaurant,isFav,onToggleFav,onClose,onViewRestaurant,onShare}) => {
  if(!deal) return null;
  const active=isActive(deal);
  const upcoming=isUpcoming(deal);
  const expDays=daysUntilExpiry(deal.expiryDate);
  const mapsUrl=restaurant?`https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`:"#";

  return (
    <Modal open={!!deal} onClose={onClose} title="Deal Details">
      <div style={{fontFamily:FB}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <span style={{fontSize:28}}>{dealEmoji(deal.category)}</span>
          <Badge>{deal.category}</Badge>
          {}
          {active&&<Badge color={BRAND.success}>● LIVE NOW</Badge>}
          {upcoming&&<Badge color={BRAND.secondaryDark} bg={`${BRAND.secondary}25`}>⏳ Upcoming</Badge>}
        </div>
        <h2 style={{fontFamily:FH,fontWeight:900,fontSize:22,color:BRAND.text,margin:"0 0 6px",lineHeight:1.2}}>{deal.title}</h2>
        <p style={{fontSize:15,color:BRAND.textMuted,lineHeight:1.5,margin:"0 0 16px"}}><PriceText text={deal.description} size={15}/></p>

        {active&&<div style={{marginBottom:12}}><Countdown endTime={deal.endTime} startTime={deal.startTime}/></div>}
        {upcoming&&<div style={{marginBottom:12}}><Countdown endTime={deal.endTime} isUp={true} startTime={deal.startTime}/></div>}

        {/* Time & days */}
        <div style={{background:BRAND.bgSoft,borderRadius:14,padding:14,marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,color:BRAND.text,marginBottom:8}}>🕐 {fTime(deal.startTime)} – {fTime(deal.endTime)}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {DAYS.map(d=>(
              <span key={d} style={{fontSize:11,padding:"4px 8px",borderRadius:8,fontWeight:deal.days.includes(d)?700:400,background:deal.days.includes(d)?(d===today()?`${BRAND.primary}18`:`${BRAND.primary}10`):"transparent",color:deal.days.includes(d)?(d===today()?BRAND.primary:BRAND.text):BRAND.textLight,fontFamily:FB}}>{d.slice(0,3)}</span>
            ))}
          </div>
          {expDays<=14&&expDays>0&&<div style={{marginTop:8}}><ExpiryBadge expiryDate={deal.expiryDate}/></div>}
          {expDays>14&&<div style={{marginTop:8,fontSize:11,color:BRAND.textLight}}>Valid until {new Date(deal.expiryDate).toLocaleDateString("en-ZA",{day:"numeric",month:"long",year:"numeric"})}</div>}
        </div>

        {/* Restaurant info - full details */}
        {restaurant&&(
          <div style={{background:BRAND.bgSoft,borderRadius:16,padding:16,marginBottom:16,border:`1px solid ${BRAND.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${BRAND.primary}15,${BRAND.secondary}20)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{cuisineEmoji(restaurant.cuisine)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:16,fontWeight:800,color:BRAND.text,fontFamily:FH}}>{restaurant.name}</div>
                <div style={{fontSize:12,color:BRAND.textMuted}}>{restaurant.cuisine} • {restaurant.category}</div>
              </div>
              
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:BRAND.text}}>
                <span style={{fontSize:15}}>📍</span>
                <span>{restaurant.address}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:BRAND.text}}>
                <span style={{fontSize:15}}>📞</span>
                <a href={`tel:${restaurant.contact}`} style={{color:BRAND.primary,textDecoration:"none",fontWeight:600}}>{restaurant.contact}</a>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:restaurant.delivery?BRAND.success:BRAND.textLight}}>
                <span style={{fontSize:15}}>{restaurant.delivery?"🛵":"🚫"}</span>
                <span style={{fontWeight:600}}>{restaurant.delivery?"Delivery available":"Dine-in only"}</span>
              </div>
            </div>
            <button onClick={()=>{onClose();setTimeout(()=>onViewRestaurant(restaurant),100);}} style={{marginTop:10,width:"100%",padding:"10px 16px",borderRadius:10,border:`1px solid ${BRAND.border}`,background:"white",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:FB,color:BRAND.primary,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              🏪 See all deals from {restaurant.name} →
            </button>
          </div>
        )}

        {/* Actions */}
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>onToggleFav()} style={{flex:1,padding:14,borderRadius:14,border:`1px solid ${isFav?BRAND.danger:BRAND.border}`,background:isFav?`${BRAND.danger}08`:"white",cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:FB,color:isFav?BRAND.danger:BRAND.text}}>
            {isFav?"❤️ Saved":"🤍 Save Deal"}
          </button>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{flex:1,padding:14,borderRadius:14,border:"none",background:`linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`,color:"white",fontSize:14,fontWeight:700,fontFamily:FB,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:`0 4px 16px ${BRAND.primary}30`}}>
            🧭 Get Directions
          </a>
        </div>
        {onShare&&<button onClick={()=>onShare(deal,restaurant)} style={{width:"100%",marginTop:8,padding:12,borderRadius:14,border:`1px solid ${BRAND.primary}30`,background:`${BRAND.primary}06`,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:FB,color:BRAND.primary,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          📤 Share This Deal
        </button>}
      </div>
    </Modal>
  );
};

// ============================================================
// RESTAURANT PROFILE MODAL
// ============================================================
const RestaurantProfile = ({restaurant,deals,favorites,toggleFav,onClose,onTapDeal}) => {
  if(!restaurant) return null;
  const rDeals=deals.filter(d=>d.restaurantId===restaurant.id&&d.active);
  const activeDeals=rDeals.filter(isActive);
  const upcomingDeals=rDeals.filter(isUpcoming);
  const otherDeals=rDeals.filter(d=>!isActive(d)&&!isUpcoming(d));
  const mapsUrl=`https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`;

  return (
    <Modal open={!!restaurant} onClose={onClose} title="Restaurant">
      <div style={{fontFamily:FB}}>
        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:6}}>
          <span style={{fontSize:32}}>{cuisineEmoji(restaurant.cuisine)}</span>
          
        </div>
        <h2 style={{fontFamily:FH,fontWeight:900,fontSize:22,color:BRAND.text,margin:"0 0 4px"}}>{restaurant.name}</h2>
        <p style={{fontSize:13,color:BRAND.textMuted,margin:"0 0 4px"}}>{restaurant.cuisine} • {restaurant.category}</p>
        <p style={{fontSize:13,color:BRAND.textMuted,margin:"0 0 4px"}}>📍 {restaurant.address}</p>
        <p style={{fontSize:13,color:BRAND.textMuted,margin:"0 0 4px"}}>📞 {restaurant.contact}</p>
        <p style={{fontSize:13,color:restaurant.delivery?BRAND.success:BRAND.textLight,margin:"0 0 16px",fontWeight:600}}>{restaurant.delivery?"🛵 Delivery available":"🚫 Dine-in only"}</p>

        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{display:"block",padding:14,borderRadius:14,background:`linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`,color:"white",fontSize:14,fontWeight:700,fontFamily:FB,textAlign:"center",textDecoration:"none",marginBottom:16,boxShadow:`0 4px 16px ${BRAND.primary}30`}}>🧭 Get Directions</a>

        {rDeals.length===0?(
          <div style={{textAlign:"center",padding:24,color:BRAND.textMuted,fontSize:14}}>No active deals right now</div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {activeDeals.length>0&&<div style={{fontSize:12,fontWeight:700,color:BRAND.success,fontFamily:FB}}>🔥 Active Now ({activeDeals.length})</div>}
            {activeDeals.map(d=><DealCard key={d.id} deal={d} restaurant={restaurant} isFav={favorites.includes(d.id)} onToggleFav={()=>toggleFav(d.id)} onTap={onTapDeal}/>)}
            {upcomingDeals.length>0&&<div style={{fontSize:12,fontWeight:700,color:BRAND.secondaryDark,fontFamily:FB,marginTop:4}}>⏳ Coming Up ({upcomingDeals.length})</div>}
            {upcomingDeals.map(d=><DealCard key={d.id} deal={d} restaurant={restaurant} isUp isFav={favorites.includes(d.id)} onToggleFav={()=>toggleFav(d.id)} onTap={onTapDeal}/>)}
            {otherDeals.length>0&&<div style={{fontSize:12,fontWeight:700,color:BRAND.textMuted,fontFamily:FB,marginTop:4}}>📋 Other Days ({otherDeals.length})</div>}
            {otherDeals.map(d=><DealCard key={d.id} deal={d} restaurant={restaurant} isFav={favorites.includes(d.id)} onToggleFav={()=>toggleFav(d.id)} onTap={onTapDeal}/>)}
          </div>
        )}
      </div>
    </Modal>
  );
};

// ============================================================
// SMART EMPTY STATE
// ============================================================
const EmptyState = ({filter,radius,allDeals,restaurantMap,userLat,userLng,onChangeFilter,onExpandRadius}) => {
  const todayName=today();
  const now=new Date();
  const nearbyActive=allDeals.filter(d=>{const r=restaurantMap[d.restaurantId];return r&&r.active&&d.active&&hDist(userLat,userLng,r.lat,r.lng)<=radius;});
  const todayDeals=nearbyActive.filter(d=>d.days.includes(todayName)&&new Date(d.expiryDate)>=now);
  const upcomingCount=todayDeals.filter(isUpcoming).length;
  const activeCount=todayDeals.filter(isActive).length;
  const beyondRadius=allDeals.filter(d=>{const r=restaurantMap[d.restaurantId];return r&&r.active&&d.active&&d.days.includes(todayName)&&hDist(userLat,userLng,r.lat,r.lng)>radius&&hDist(userLat,userLng,r.lat,r.lng)<=10;}).length;

  return (
    <div style={{textAlign:"center",padding:"32px 20px",background:"white",borderRadius:18,border:`1px solid ${BRAND.border}`,fontFamily:FB}}>
      <div style={{fontSize:44,marginBottom:12}}>🍽️</div>
      <h3 style={{color:BRAND.text,fontFamily:FH,fontWeight:800,margin:"0 0 8px",fontSize:17}}>
        No {filter==="active"?"active":filter==="upcoming"?"upcoming":""} deals found
      </h3>

      {filter==="active"&&upcomingCount>0&&(
        <div style={{marginTop:12}}>
          <p style={{color:BRAND.textMuted,fontSize:13,margin:"0 0 10px"}}>But there {upcomingCount===1?"is":"are"} <strong>{upcomingCount}</strong> deal{upcomingCount!==1?"s":""} coming up later today!</p>
          <button onClick={()=>onChangeFilter("upcoming")} style={{padding:"10px 24px",borderRadius:10,border:"none",background:BRAND.secondary,color:BRAND.text,fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:FB}}>⏳ Show Upcoming</button>
        </div>
      )}

      {filter==="active"&&upcomingCount===0&&activeCount===0&&beyondRadius>0&&(
        <div style={{marginTop:12}}>
          <p style={{color:BRAND.textMuted,fontSize:13,margin:"0 0 10px"}}>There {beyondRadius===1?"is":"are"} <strong>{beyondRadius}</strong> deal{beyondRadius!==1?"s":""} a bit further out.</p>
          <button onClick={onExpandRadius} style={{padding:"10px 24px",borderRadius:10,border:"none",background:BRAND.primary,color:"white",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:FB}}>📍 Expand to 10km</button>
        </div>
      )}

      {filter!=="active"&&(
        <p style={{color:BRAND.textMuted,fontSize:13,margin:"8px 0 0"}}>Try a different day, expand your radius, or clear filters.</p>
      )}
    </div>
  );
};


// ============================================================
// MAIN APP
// ============================================================
export default function GrubGrab() {
  const [restaurants,setRestaurants]=useState([]);
  const [deals,setDeals]=useState([]);
  const [favorites,setFavorites]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const [onboarded,setOnboarded]=useState(false);
  const [view,setView]=useState("user"); // user only now

  const [userLat,setUserLat]=useState(-26.1460);
  const [userLng,setUserLng]=useState(28.0436);
  const [radius,setRadius]=useState(10);
  const [filter,setFilter]=useState("all");
  const [cuisineFilter,setCuisineFilter]=useState("All Cuisines");
  const [deliveryOnly,setDeliveryOnly]=useState(false);
  const [calendarDay,setCalendarDay]=useState(null);
  const [showFavs,setShowFavs]=useState(false);
  const [locating,setLocating]=useState(false);
  const [selectedDeal,setSelectedDeal]=useState(null);
  const [selectedRestaurant,setSelectedRestaurant]=useState(null);
  const [searchQuery,setSearchQuery]=useState("");
  const [logoTaps,setLogoTaps]=useState(0);
  const logoTapTimer=useRef(null);

  useEffect(()=>{(async()=>{
    try {
      const r=await sbFetch("restaurants",{query:"?order=name"});
      const d=await sbFetch("deals",{query:"?order=created_at"});
      setRestaurants(r||[]);
      setDeals((d||[]).map(dl=>({...dl,restaurantId:dl.restaurant_id,startTime:dl.start_time,endTime:dl.end_time,expiryDate:dl.expiry_date})));
    } catch(e) {
      console.error("Supabase load failed, using seed data:",e);
      setRestaurants(SEED_R);setDeals(SEED_D);
    }
    setFavorites(loadFavs());
    setOnboarded(localStorage.getItem("gg-onboarded")==="true");
    setLoaded(true);
  })();},[]);

  // Data lives in Supabase — no local save needed for restaurants/deals
  // Refresh data from Supabase
  const refreshData=useCallback(async()=>{
    try {
      const r=await sbFetch("restaurants",{query:"?order=name"});
      const d=await sbFetch("deals",{query:"?order=created_at"});
      setRestaurants(r||[]);
      setDeals((d||[]).map(dl=>({...dl,restaurantId:dl.restaurant_id,startTime:dl.start_time,endTime:dl.end_time,expiryDate:dl.expiry_date})));
    } catch(e){console.error("Refresh failed:",e);}
  },[]);

  // Auto-refresh every 60 seconds
  useEffect(()=>{if(!loaded)return;const i=setInterval(refreshData,60000);return()=>clearInterval(i);},[loaded,refreshData]);

  useEffect(()=>{if(loaded)saveFavs(favorites);},[favorites,loaded]);

  const toggleFav=useCallback((id)=>{setFavorites(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);},[]);

  const getLocation=useCallback(()=>{
    setLocating(true);
    if(navigator.geolocation)navigator.geolocation.getCurrentPosition(pos=>{setUserLat(pos.coords.latitude);setUserLng(pos.coords.longitude);setLocating(false);},()=>setLocating(false),{enableHighAccuracy:true});
    else setLocating(false);
  },[]);

  const rMap=useMemo(()=>{const m={};restaurants.forEach(r=>m[r.id]=r);return m;},[restaurants]);

  const dayFilter=calendarDay||"Today";
  const processedDeals=useMemo(()=>{
    const now=new Date();const td=today();
    return deals.filter(d=>{
      const r=rMap[d.restaurantId];
      if(!r||!r.active||!d.active)return false;
      if(hDist(userLat,userLng,r.lat,r.lng)>radius)return false;
      if(new Date(d.expiryDate)<now)return false;
      if(cuisineFilter!=="All Cuisines"&&r.cuisine!==cuisineFilter)return false;
      if(deliveryOnly&&!r.delivery)return false;
      if(showFavs&&!favorites.includes(d.id))return false;
      const effDay=calendarDay||td;
      if(!d.days.includes(effDay))return false;
      if(filter==="active")return isActive(d);
      if(filter==="upcoming")return isUpcoming(d);
      return true;
    }).map(d=>{const r=rMap[d.restaurantId];return{...d,distance:r?hDist(userLat,userLng,r.lat,r.lng):999,restaurant:r};})
    .sort((a,b)=>a.distance-b.distance);
  },[deals,rMap,userLat,userLng,radius,filter,cuisineFilter,deliveryOnly,calendarDay,showFavs,favorites]);

  // 7-tap secret admin access
  const handleLogoTap=useCallback(()=>{
    setLogoTaps(p=>{
      const next=p+1;
      if(logoTapTimer.current)clearTimeout(logoTapTimer.current);
      logoTapTimer.current=setTimeout(()=>setLogoTaps(0),2000);
      if(next>=7){setLogoTaps(0);return 0;} // admin access removed from user app
      return next;
    });
  },[]);

  // Share deal (native share API with clipboard fallback)
  const [shareToast,setShareToast]=useState(false);
  const shareDeal=async(deal,restaurant)=>{
    const text=`🍔 Check out this deal on GrubGrab!\n\n${deal.title}\n${deal.description}\n🏪 ${restaurant?.name||""}\n🕐 ${fTime(deal.startTime)}–${fTime(deal.endTime)}\n\n📲 Get the app: https://grubgrab.co.za`;
    try {
      if(navigator.share){
        await navigator.share({title:`${deal.title} — GrubGrab`,text});
        return;
      }
    } catch(e) {
      if(e.name==="AbortError")return; // user cancelled, that's fine
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setShareToast(true);setTimeout(()=>setShareToast(false),2500);
    } catch {
      // Final fallback: textarea copy method
      const ta=document.createElement("textarea");
      ta.value=text;ta.style.position="fixed";ta.style.left="-9999px";
      document.body.appendChild(ta);ta.select();
      try{document.execCommand("copy");setShareToast(true);setTimeout(()=>setShareToast(false),2500);}catch{}
      document.body.removeChild(ta);
    }
  };

  // Contextual greeting
  const getGreeting=()=>{
    const h=new Date().getHours();
    const dayName=today();
    const dealCount=processedDeals.length;
    const prefix=h<12?"Good morning":h<17?"Good afternoon":"Good evening";
    if(dealCount>0)return `${prefix}! Happy ${dayName} — ${dealCount} deal${dealCount!==1?"s":""} near you 🔥`;
    return `${prefix}! Happy ${dayName}`;
  };

  // Deals ending within 1 hour
  const endingSoonDeals=useMemo(()=>{
    return processedDeals.filter(d=>{
      if(!isActive(d))return false;
      const minsLeft=tMin(d.endTime)-nowMin();
      return minsLeft>0&&minsLeft<=60;
    });
  },[processedDeals]);

  // Best next day (for empty state)
  const bestNextDay=useMemo(()=>{
    const now=new Date();
    let best=null,bestCount=0;
    for(let i=1;i<7;i++){
      const dt=new Date(now);dt.setDate(dt.getDate()+i);
      const dn=DAYS[dt.getDay()];
      const count=deals.filter(d=>d.active&&d.days.includes(dn)&&new Date(d.expiryDate)>=now).length;
      if(count>bestCount){bestCount=count;best={day:dn,count,short:dn.slice(0,3)};}
    }
    return best;
  },[deals]);

  // Restaurant count in radius
  const nearbyRestaurantCount=useMemo(()=>{
    return restaurants.filter(r=>r.active&&hDist(userLat,userLng,r.lat,r.lng)<=radius).length;
  },[restaurants,userLat,userLng,radius]);

  // Search-filtered deals
  const searchFilteredDeals=useMemo(()=>{
    if(!searchQuery.trim())return processedDeals;
    const q=searchQuery.toLowerCase();
    return processedDeals.filter(d=>d.title.toLowerCase().includes(q)||(d.restaurant?.name||"").toLowerCase().includes(q)||d.description.toLowerCase().includes(q)||d.category.toLowerCase().includes(q));
  },[processedDeals,searchQuery]);

  const completeOnboarding=(lat,lng)=>{setUserLat(lat);setUserLng(lng);setOnboarded(true);localStorage.setItem("gg-onboarded","true");};

  if(!loaded)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:BRAND.bgSoft}}><div style={{textAlign:"center"}}><Logo size={48}/><p style={{color:BRAND.textMuted,marginTop:12,fontFamily:FB}}>Loading...</p></div></div>);

  if(!onboarded)return <Onboarding onComplete={completeOnboarding}/>;

  const selDealRestaurant=selectedDeal?rMap[selectedDeal.restaurantId]:null;

  return (
    <div style={{minHeight:"100vh",background:BRAND.bgSoft,fontFamily:FB}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(255,69,0,0.4)}50%{box-shadow:0 0 0 10px rgba(255,69,0,0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.7}}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        input[type="range"]{-webkit-appearance:none;width:100%;height:6px;border-radius:3px;background:linear-gradient(90deg,${BRAND.primary},${BRAND.secondary});outline:none}
        input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;background:white;cursor:pointer;border:3px solid ${BRAND.primary};box-shadow:0 2px 8px rgba(0,0,0,0.15)}
      `}</style>

      {/* Deal Detail Modal */}
      <DealDetail deal={selectedDeal} restaurant={selDealRestaurant} isFav={selectedDeal?favorites.includes(selectedDeal.id):false} onToggleFav={()=>selectedDeal&&toggleFav(selectedDeal.id)} onClose={()=>setSelectedDeal(null)} onViewRestaurant={r=>{setSelectedDeal(null);setSelectedRestaurant(r);}} onShare={shareDeal}/>

      {/* Restaurant Profile Modal */}
      <RestaurantProfile restaurant={selectedRestaurant} deals={deals} favorites={favorites} toggleFav={toggleFav} onClose={()=>setSelectedRestaurant(null)} onTapDeal={d=>{setSelectedRestaurant(null);setSelectedDeal(d);}}/>

      {/* Copied toast */}
      {shareToast&&<div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",background:BRAND.text,color:"white",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:700,fontFamily:FB,zIndex:2000,boxShadow:"0 4px 20px rgba(0,0,0,0.3)",animation:"slideUp 0.2s ease"}}>✅ Copied to clipboard!</div>}
      {/* Header */}
      <div style={{background:"white",borderBottom:`1px solid ${BRAND.border}`,padding:"10px 16px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:520,margin:"0 auto"}}>
          <div onClick={handleLogoTap} style={{cursor:"pointer",userSelect:"none"}}><Logo size={26}/></div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>setShowFavs(!showFavs)} aria-label="Toggle favorites" style={{padding:"6px 12px",borderRadius:10,border:showFavs?"none":`1px solid ${BRAND.border}`,background:showFavs?`${BRAND.danger}10`:"white",cursor:"pointer",fontSize:12,fontFamily:FB,fontWeight:600,color:showFavs?BRAND.danger:BRAND.textMuted}}>
              ❤️ {favorites.length}
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:520,margin:"0 auto",padding:"12px 16px 60px"}}>
        {/* Contextual Greeting */}
        <div style={{marginBottom:10,padding:"0 2px"}}>
          <h2 style={{fontFamily:FH,fontWeight:800,fontSize:17,color:BRAND.text,margin:0,lineHeight:1.3}}>{getGreeting()}</h2>
          <p style={{fontSize:12,color:BRAND.textMuted,margin:"2px 0 0",fontFamily:FB}}>{nearbyRestaurantCount} restaurant{nearbyRestaurantCount!==1?"s":""} within {radius}km</p>
        </div>

        {/* Search Bar */}
        <div style={{position:"relative",marginBottom:10}}>
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="🔍 Search restaurants or deals..." style={{width:"100%",padding:"11px 16px 11px 16px",borderRadius:14,border:`1px solid ${BRAND.border}`,fontSize:13,fontFamily:FB,fontWeight:500,outline:"none",background:"white",boxSizing:"border-box"}}/>
          {searchQuery&&<button onClick={()=>setSearchQuery("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:14,color:BRAND.textLight,padding:0}}>✕</button>}
        </div>

        {/* Location + Radius */}
        <button onClick={getLocation} disabled={locating} style={{width:"100%",padding:14,borderRadius:16,border:"none",marginBottom:10,background:`linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`,color:"white",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:FH,boxShadow:`0 4px 20px ${BRAND.primary}40`,display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:locating?0.7:1}}>
          {locating?"📡 Locating...":"📍 Search Near Me"}
        </button>

        <div style={{background:"white",borderRadius:14,padding:"10px 16px",marginBottom:10,border:`1px solid ${BRAND.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:13,fontWeight:700,color:BRAND.text}}>Radius</span>
            <span style={{fontSize:15,fontWeight:900,color:BRAND.primary,background:`${BRAND.primary}10`,padding:"2px 10px",borderRadius:8,fontFamily:FH}}>{radius}km</span>
          </div>
          <input type="range" min={1} max={10} value={radius} onChange={e=>setRadius(parseInt(e.target.value))} style={{cursor:"pointer"}}/>
        </div>

        {/* Map */}
        <MapView deals={processedDeals} restaurants={restaurants} userLat={userLat} userLng={userLng} radius={radius} onTapRestaurant={r=>setSelectedRestaurant(r)}/>

        {/* Deals Ending Soon Banner */}
        {endingSoonDeals.length>0&&(
          <div style={{marginTop:10,background:`linear-gradient(135deg,${BRAND.danger}08,${BRAND.primary}06)`,borderRadius:14,padding:"10px 14px",border:`1px solid ${BRAND.danger}15`}}>
            <div style={{fontSize:12,fontWeight:800,color:BRAND.danger,fontFamily:FH,marginBottom:6,display:"flex",alignItems:"center",gap:4}}>
              <span style={{animation:"pulse 1.5s infinite"}}>🔥</span> Ending Soon — grab these before they're gone!
            </div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
              {endingSoonDeals.slice(0,4).map(d=>(
                <div key={d.id} onClick={()=>setSelectedDeal(d)} style={{minWidth:160,background:"white",borderRadius:10,padding:"8px 10px",cursor:"pointer",border:`1px solid ${BRAND.danger}15`,flexShrink:0,fontFamily:FB}}>
                  <div style={{fontSize:11,fontWeight:700,color:BRAND.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{dealEmoji(d.category)} {d.title}</div>
                  <div style={{fontSize:10,color:BRAND.textMuted,marginTop:2}}>{d.restaurant?.name}</div>
                  <div style={{fontSize:10,fontWeight:700,color:BRAND.danger,marginTop:2}}>🔥 {timeLeft(d.endTime)} left</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar */}
        <div style={{marginTop:10}}>
          <WeeklyCalendar deals={deals} restaurants={restaurants} selectedDay={calendarDay} onSelectDay={d=>setCalendarDay(d)}/>
        </div>

        {/* Time Filter */}
        <div style={{display:"flex",gap:4,marginBottom:8}}>
          {[{k:"all",l:`📋 ${calendarDay?calendarDay.slice(0,3):"Today"}`},{k:"active",l:"🔥 Live"},{k:"upcoming",l:"⏳ Soon"}].map(f=>(
            <button key={f.k} onClick={()=>setFilter(f.k)} style={{flex:1,padding:"9px 6px",borderRadius:12,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:FB,background:filter===f.k?BRAND.primary:"white",color:filter===f.k?"white":BRAND.textMuted,boxShadow:filter===f.k?`0 2px 8px ${BRAND.primary}30`:"none"}}>{f.l}</button>
          ))}
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:6,marginBottom:12,alignItems:"center"}}>
          <select value={cuisineFilter} onChange={e=>setCuisineFilter(e.target.value)} style={{flex:1,padding:"8px 12px",borderRadius:10,border:`1px solid ${BRAND.border}`,fontSize:12,color:BRAND.text,background:"white",cursor:"pointer",fontFamily:FB,fontWeight:600}} aria-label="Filter by cuisine">
            {CUISINES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={()=>setDeliveryOnly(!deliveryOnly)} aria-label="Toggle delivery filter" style={{padding:"8px 14px",borderRadius:10,border:deliveryOnly?"none":`1px solid ${BRAND.border}`,background:deliveryOnly?`${BRAND.success}12`:"white",cursor:"pointer",fontSize:12,fontFamily:FB,fontWeight:700,color:deliveryOnly?BRAND.success:BRAND.textMuted,display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",transition:"all 0.2s"}}>
            🛵 Delivery
          </button>
        </div>

        {/* Results count */}
        <div style={{marginBottom:10,fontSize:13,fontWeight:700,color:BRAND.textMuted,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span>{showFavs?"❤️ ":""}{searchFilteredDeals.length} deal{searchFilteredDeals.length!==1?"s":""}{searchQuery?` matching "${searchQuery}"`:""}</span>
          {(cuisineFilter!=="All Cuisines"||showFavs||deliveryOnly||searchQuery)&&(
            <button onClick={()=>{setCuisineFilter("All Cuisines");setShowFavs(false);setDeliveryOnly(false);setSearchQuery("");}} style={{background:"none",border:"none",color:BRAND.primary,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:FB}}>Clear all ✕</button>
          )}
        </div>

        {/* Deal List */}
        {searchFilteredDeals.length===0?(
          processedDeals.length===0?(
            <div style={{textAlign:"center",padding:"32px 20px",background:"white",borderRadius:18,border:`1px solid ${BRAND.border}`,fontFamily:FB}}>
              <div style={{fontSize:44,marginBottom:12}}>🍽️</div>
              <h3 style={{color:BRAND.text,fontFamily:FH,fontWeight:800,margin:"0 0 8px",fontSize:17}}>
                No {filter==="active"?"active":filter==="upcoming"?"upcoming":""} deals {calendarDay?"on "+calendarDay:"today"}
              </h3>
              {bestNextDay&&(
                <div style={{marginTop:12}}>
                  <p style={{color:BRAND.textMuted,fontSize:13,margin:"0 0 10px"}}>But <strong>{bestNextDay.day}</strong> has <strong>{bestNextDay.count}</strong> deal{bestNextDay.count!==1?"s":""}!</p>
                  <button onClick={()=>setCalendarDay(bestNextDay.day)} style={{padding:"10px 24px",borderRadius:10,border:"none",background:BRAND.secondary,color:BRAND.text,fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:FB}}>📅 Check {bestNextDay.short}</button>
                </div>
              )}
              <EmptyState filter={filter} radius={radius} allDeals={deals} restaurantMap={rMap} userLat={userLat} userLng={userLng} onChangeFilter={setFilter} onExpandRadius={()=>setRadius(10)}/>
            </div>
          ):(
            <div style={{textAlign:"center",padding:"24px 20px",background:"white",borderRadius:18,border:`1px solid ${BRAND.border}`,fontFamily:FB}}>
              <div style={{fontSize:36,marginBottom:8}}>🔍</div>
              <h3 style={{color:BRAND.text,fontFamily:FH,fontWeight:800,margin:"0 0 6px",fontSize:16}}>No results for "{searchQuery}"</h3>
              <p style={{color:BRAND.textMuted,fontSize:13,margin:0}}>Try a different restaurant name or deal</p>
            </div>
          )
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {searchFilteredDeals.map((d,i)=>(
              <div key={d.id} style={{animation:`slideUp 0.3s ease ${i*0.04}s both`}}>
                <DealCard deal={d} restaurant={d.restaurant} distance={d.distance} isUp={filter==="upcoming"} isFav={favorites.includes(d.id)} onToggleFav={()=>toggleFav(d.id)} onTap={()=>setSelectedDeal(d)}/>
              </div>
            ))}
          </div>
        )}

        <div style={{textAlign:"center",marginTop:32,padding:16,color:BRAND.textLight,fontSize:11}}>
          <Logo size={18} showText={false}/><p style={{marginTop:6}}>Powered by GrubGrab</p>
        </div>
      </div>
    </div>
  );
}
