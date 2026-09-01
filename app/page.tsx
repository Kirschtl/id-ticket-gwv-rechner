"use client";
import {useMemo,useState} from "react";
import {ArrowDown,ArrowRight,CircleHelp,Plane,Plus,RotateCcw,Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {Combobox,ComboboxContent,ComboboxEmpty,ComboboxInput,ComboboxItem,ComboboxList} from "@/components/ui/combobox";
import {AIRPORTS,type Airport} from "./airport-data";
type Segment={id:number;from:string;to:string};
const money=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"});
const integer=new Intl.NumberFormat("de-DE",{maximumFractionDigits:0});
function distance(a:Airport,b:Airport){const r=(v:number)=>v*Math.PI/180,dLat=r(b.lat-a.lat),dLon=r(b.lon-a.lon),x=Math.sin(dLat/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dLon/2)**2;return Math.round(6371.0088*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)))}
function factorFor(km:number){const raw=km<=4000?.06:km>12000?.03:.06-.03*(km-4000)/8000;return Math.floor(raw*100000)/100000}
const ALL_AIRPORTS=Object.values(AIRPORTS);
const airportLabel=(a:Airport)=>`${a.iata} · ${a.icao||"—"} — ${a.city} · ${a.name}`;
function AirportInput({value,onChange,label}:{value:string;onChange:(v:string)=>void;label:string}){
 const selected=AIRPORTS[value];
 const [query,setQuery]=useState(selected?airportLabel(selected):value);
 const matches=useMemo(()=>{const q=query.trim().toLocaleLowerCase("de");if(!q)return ALL_AIRPORTS.slice(0,30);const terms=q.split(/\s+/);return ALL_AIRPORTS.filter(a=>{const hay=`${a.iata} ${a.icao} ${a.city} ${a.name}`.toLocaleLowerCase("de");return terms.every(t=>hay.includes(t))}).slice(0,40)},[query]);
 return <label className="airport-field"><span>{label}</span><Combobox items={matches} value={selected??null} inputValue={query} itemToStringLabel={airportLabel} filter={null} onInputValueChange={setQuery} onValueChange={(a:Airport|null)=>{if(a){onChange(a.iata);setQuery(airportLabel(a))}}}><ComboboxInput placeholder="LPA, GCLP oder Gran Canaria" showClear={false}/><ComboboxContent><ComboboxEmpty>Kein Flughafen gefunden</ComboboxEmpty><ComboboxList>{(a:Airport)=><ComboboxItem key={a.iata} value={a}><span className="airport-option-code">{a.iata}</span><span><b>{a.city}</b><small>{a.icao} · {a.name}</small></span></ComboboxItem>}</ComboboxList></ComboboxContent></Combobox><small className={selected?"known":""}>{selected?`${selected.iata} · ${selected.icao} · ${selected.city}`:"Suche nach IATA, ICAO, Ort oder Name"}</small></label>}
export default function Home(){
 const [segments,setSegments]=useState<Segment[]>([{id:1,from:"MUC",to:"PMI"}]),[ticketType,setTicketType]=useState("sa"),[fare,setFare]=useState("24"),[taxRate,setTaxRate]=useState("40"),[nextId,setNextId]=useState(2);
 const route=useMemo(()=>segments.map(s=>{const a=AIRPORTS[s.from],b=AIRPORTS[s.to];return{...s,a,b,km:a&&b?distance(a,b):0}}),[segments]);
 const complete=route.every(s=>s.a&&s.b),km=route.reduce((n,s)=>n+s.km,0),factor=factorFor(km),average=km*factor,share=ticketType==="sa"?.6:ticketType==="restricted"?.8:1,reduced=average*share,surcharge=reduced*1.1,paid=Math.max(0,Number(fare.replace(",","."))||0),benefit=Math.max(0,surcharge-paid),tax=benefit*Math.max(0,Number(taxRate.replace(",","."))||0)/100;
 const change=(id:number,key:"from"|"to",value:string)=>setSegments(all=>all.map(s=>s.id===id?{...s,[key]:value}:s));
 const add=()=>{const last=segments.at(-1);setSegments(all=>[...all,{id:nextId,from:last?.to||"",to:""}]);setNextId(n=>n+1)};
 const addReturn=()=>{const back=[...segments].reverse().map((s,i)=>({id:nextId+i,from:s.to,to:s.from}));setSegments(all=>[...all,...back]);setNextId(n=>n+back.length)};
 return <main>
  <header className="topbar"><div className="brand"><span className="brand-mark"><Plane/></span><div><strong>ID-Ticket</strong><span>GWV Rechner · 2026/2027</span></div></div><span className="method-pill">Durchschnittswertmethode</span></header>
  <div className="workspace"><section className="input-panel">
   <div className="section-heading"><span>01</span><div><h1>Flugstrecke</h1><p>Streckenführung wie auf dem Flugschein</p></div></div>
   <div className="segments">{route.map((s,i)=><div className="segment" key={s.id}><div className="segment-label">Segment {i+1}</div><div className="airport-row"><AirportInput label="Von" value={s.from} onChange={v=>change(s.id,"from",v)}/><ArrowRight className="route-arrow"/><AirportInput label="Nach" value={s.to} onChange={v=>change(s.id,"to",v)}/>{segments.length>1&&<Button className="remove" variant="ghost" size="icon" aria-label="Segment entfernen" onClick={()=>setSegments(all=>all.filter(x=>x.id!==s.id))}><Trash2/></Button>}</div>{s.km>0&&<div className="segment-distance"><span/><b>{integer.format(s.km)} km</b></div>}</div>)}</div>
   <div className="route-actions"><Button variant="outline" onClick={add}><Plus/> Teilstrecke</Button><Button variant="outline" onClick={addReturn}><RotateCcw/> Rückflug ergänzen</Button></div>
   <div className="divider"/><div className="section-heading"><span>02</span><div><h2>Ticket & Steuer</h2><p>Nur selbst gezahltes Beförderungsentgelt angeben</p></div></div>
   <div className="form-grid"><label className="form-field wide"><span>Reservierungsstatus</span><Select value={ticketType} onValueChange={setTicketType}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sa">Standby · SA (60 %)</SelectItem><SelectItem value="restricted">Fest gebucht, eingeschränkt (80 %)</SelectItem><SelectItem value="open">Ohne Reservierungsbeschränkung (100 %)</SelectItem></SelectContent></Select></label><label className="form-field"><span>Bezahlter Ticketpreis</span><div className="suffix"><Input inputMode="decimal" value={fare} onChange={e=>setFare(e.target.value)}/><b>€</b></div><small>Ohne Steuern, Gebühren und MyID-Fee</small></label><label className="form-field"><span>Persönlicher Steuersatz</span><div className="suffix"><Input inputMode="decimal" value={taxRate} onChange={e=>setTaxRate(e.target.value)}/><b>%</b></div><small>Schätzung der Steuerbelastung</small></label></div>
  </section><aside className="result-panel"><div className="result-kicker">Ergebnis</div><div className="route-code">{segments.map((s,i)=><span key={s.id}>{i===0?s.from:""}<ArrowRight/>{s.to}</span>)}</div><div className="distance-total"><span>Gesamtstrecke</span><strong>{complete?integer.format(km):"—"} <small>km</small></strong></div><div className="primary-result"><span>Geldwerter Vorteil</span><strong>{complete?money.format(benefit):"—"}</strong></div><div className="tax-result"><div><span>Voraussichtliche Steuer</span><small>bei {taxRate||0} %</small></div><strong>{complete?money.format(tax):"—"}</strong></div>
   <div className="calculation"><h2>Rechenweg</h2><div><span>Durchschnittswert</span><b>{money.format(average)}</b><small>{integer.format(km)} km × {factor.toFixed(5).replace(".",",")} €</small></div><ArrowDown/><div><span>{Math.round(share*100)}-%-Ansatz</span><b>{money.format(reduced)}</b></div><ArrowDown/><div><span>Zuzüglich 10 %</span><b>{money.format(surcharge)}</b></div><ArrowDown/><div><span>Abzüglich Ticketpreis</span><b>− {money.format(paid)}</b></div></div>
   <div className="notice"><CircleHelp/><p><strong>Wichtig:</strong> Gebühren und Steuern sind keine abziehbaren Eigenanteile. Fremdairline-Tickets können einer anderen Bewertungsmethode unterliegen.</p></div>
  </aside></div><footer>Unverbindliche Berechnung nach dem gleich lautenden Ländererlass vom 5. November 2025. Keine Steuerberatung.</footer>
 </main>}
