import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area
} from "recharts";

/* ══════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════ */
const PARKS = [
  "Murchison Falls","Queen Elizabeth","Bwindi","Kidepo Valley",
  "Lake Mburo","Rwenzori","Mgahinga","Mt Elgon","Semuliki",
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const MONTHLY_REV = [
  {month:"Jan",actual:312000000,target:290000000,visitors:4120},
  {month:"Feb",actual:298000000,target:290000000,visitors:3980},
  {month:"Mar",actual:421000000,target:350000000,visitors:5540},
  {month:"Apr",actual:389000000,target:350000000,visitors:5100},
  {month:"May",actual:504000000,target:420000000,visitors:6630},
  {month:"Jun",actual:476000000,target:420000000,visitors:6250},
  {month:"Jul",actual:612000000,target:500000000,visitors:8040},
  {month:"Aug",actual:589000000,target:500000000,visitors:7720},
  {month:"Sep",actual:445000000,target:420000000,visitors:5840},
  {month:"Oct",actual:398000000,target:380000000,visitors:5230},
  {month:"Nov",actual:362000000,target:350000000,visitors:4760},
  {month:"Dec",actual:528000000,target:460000000,visitors:6940},
];

const PARK_PERF = [
  {park:"Murchison Falls", rev:1284000000, target:1100000000, visitors:22400, gates:4, avgTime:7.8, captureRate:99.1},
  {park:"Queen Elizabeth",  rev:1096000000, target:1000000000, visitors:19800, gates:5, avgTime:8.2, captureRate:99.3},
  {park:"Bwindi",           rev:1840000000, target:1600000000, visitors:14200, gates:3, avgTime:9.1, captureRate:99.6},
  {park:"Kidepo Valley",    rev:378000000,  target:400000000,  visitors:8900,  gates:2, avgTime:11.4, captureRate:97.2},
  {park:"Lake Mburo",       rev:284000000,  target:260000000,  visitors:11200, gates:2, avgTime:7.4, captureRate:99.4},
  {park:"Rwenzori",         rev:333000000,  target:310000000,  visitors:7800,  gates:2, avgTime:8.9, captureRate:99.0},
  {park:"Mgahinga",         rev:658000000,  target:580000000,  visitors:6200,  gates:1, avgTime:9.6, captureRate:99.5},
  {park:"Mt Elgon",         rev:170000000,  target:180000000,  visitors:5900,  gates:2, avgTime:8.1, captureRate:98.8},
  {park:"Semuliki",         rev:107000000,  target:120000000,  visitors:4600,  gates:1, avgTime:7.9, captureRate:98.6},
];

const PAYMENT_MIX = [
  {name:"Mobile Money", value:58, color:"#22c55e"},
  {name:"Card",         value:24, color:"#3b82f6"},
  {name:"RFID",         value:12, color:"#f59e0b"},
  {name:"Cash",         value:6,  color:"#94a3b8"},
];

const ANOMALIES = [
  {id:"ANO-001",park:"Kidepo Valley",gate:"Main Gate",date:"9 May 2026",type:"Sync gap",detail:"14-min offline window. 3 cash transactions unverified.",severity:"high",status:"open"},
  {id:"ANO-002",park:"Queen Elizabeth",gate:"Ishasha Gate",date:"8 May 2026",type:"Revenue variance",detail:"Gate rev 22% below daily average. Manual recount requested.",severity:"medium",status:"open"},
  {id:"ANO-003",park:"Mt Elgon",gate:"Sasa Gate",date:"7 May 2026",type:"Capture shortfall",detail:"98.1% capture vs 99% SLA. 6 transactions flagged.",severity:"low",status:"resolved"},
  {id:"ANO-004",park:"Semuliki",gate:"Main Gate",date:"6 May 2026",type:"Cash > 15%",detail:"Cash share rose to 18%. Possible POS downtime.",severity:"medium",status:"resolved"},
  {id:"ANO-005",park:"Murchison Falls",gate:"Tangi Gate",date:"5 May 2026",type:"Transaction spike",detail:"312% above hourly average — possible queue backlog cleared.",severity:"low",status:"resolved"},
];

const DAILY_7 = [
  {day:"Mon",rev:28500000,tx:612},
  {day:"Tue",rev:24100000,tx:518},
  {day:"Wed",rev:31200000,tx:670},
  {day:"Thu",rev:26800000,tx:577},
  {day:"Fri",rev:34900000,tx:750},
  {day:"Sat",rev:48200000,tx:1034},
  {day:"Sun",rev:52600000,tx:1128},
];

const fmtBig = n => {
  if (n >= 1e9) return "UGX " + (n/1e9).toFixed(2) + "B";
  if (n >= 1e6) return "UGX " + (n/1e6).toFixed(1) + "M";
  return "UGX " + Math.round(n).toLocaleString();
};
const fmtM  = n => (n/1e6).toFixed(1) + "M";
const pct   = (a,b) => ((a-b)/b*100).toFixed(1);

/* ══════════════════════════════════════════════
   SHARED UI ATOMS
══════════════════════════════════════════════ */
const S = {
  severity: {
    high:   {bg:"#2d1010",text:"#f87171",dot:"#ef4444"},
    medium: {bg:"#2a1d08",text:"#fbbf24",dot:"#f59e0b"},
    low:    {bg:"#0d2016",text:"#6ee7b7",dot:"#22c55e"},
  },
  status: {
    open:     {bg:"#1e293b",text:"#94a3b8"},
    resolved: {bg:"#0d2016",text:"#22c55e"},
  },
};

function Chip({ label, color = "green" }) {
  const map = {
    green: { bg:"#0d2016", text:"#22c55e" },
    blue:  { bg:"#0c1a2e", text:"#60a5fa" },
    amber: { bg:"#2a1d08", text:"#fbbf24" },
    red:   { bg:"#2d1010", text:"#f87171" },
    gray:  { bg:"#1e293b", text:"#94a3b8" },
  };
  const c = map[color];
  return (
    <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20,
      background:c.bg, color:c.text, letterSpacing:"0.02em" }}>{label}</span>
  );
}

function StatBox({ label, value, sub, accent, trend }) {
  return (
    <div style={{ background: accent ? "#14532d" : "#0f172a",
      border: `1px solid ${accent ? "#166534" : "#1e293b"}`,
      borderRadius:10, padding:"14px 16px" }}>
      <div style={{ fontSize:11, color:"#64748b", marginBottom:6, letterSpacing:"0.05em", textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:800, color: accent ? "#4ade80" : "#f1f5f9", letterSpacing:"-0.02em", lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color: trend === "up" ? "#22c55e" : trend === "down" ? "#f87171" : "#64748b", marginTop:5 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
      <div style={{ fontSize:13, fontWeight:800, color:"#cbd5e1", letterSpacing:"0.05em", textTransform:"uppercase" }}>{children}</div>
      {action}
    </div>
  );
}

function Panel({ children, style = {} }) {
  return (
    <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:12, padding:"16px 18px", ...style }}>
      {children}
    </div>
  );
}

const SIDEBAR_ITEMS = [
  { id:"overview",   icon:"◈",  label:"Overview"        },
  { id:"revenue",    icon:"↗",  label:"Revenue"         },
  { id:"parks",      icon:"⬡",  label:"Park performance"},
  { id:"gates",      icon:"⊞",  label:"Gate analytics"  },
  { id:"anomalies",  icon:"⚠",  label:"Anomalies"       },
  { id:"payments",   icon:"⊕",  label:"Payment mix"     },
  { id:"export",     icon:"↓",  label:"Export & policy" },
];

/* ══════════════════════════════════════════════
   TOOLTIP (custom recharts)
══════════════════════════════════════════════ */
function DarkTip({ active, payload, label, prefix = "UGX " }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:8,
      padding:"8px 12px", fontSize:12, color:"#f1f5f9" }}>
      <div style={{ color:"#64748b", marginBottom:4 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color, fontWeight:700 }}>
          {p.name}: {typeof p.value === "number" && p.value > 1e4 ? fmtBig(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTIONS
══════════════════════════════════════════════ */
function Overview() {
  const totalRev = PARK_PERF.reduce((s,p)=>s+p.rev,0);
  const totalVis = PARK_PERF.reduce((s,p)=>s+p.visitors,0);
  const avgCapture = (PARK_PERF.reduce((s,p)=>s+p.captureRate,0)/PARK_PERF.length).toFixed(1);
  const openAlerts = ANOMALIES.filter(a=>a.status==="open").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        <StatBox label="YTD revenue"      value={fmtBig(totalRev)}     sub="↑ 14.2% vs last year"  trend="up"   accent />
        <StatBox label="Total visitors"   value={totalVis.toLocaleString()} sub="↑ 11.8% vs last year"  trend="up" />
        <StatBox label="Avg capture rate" value={avgCapture+"%"}        sub="Target ≥ 99%"               trend="up" />
        <StatBox label="Open anomalies"   value={openAlerts}            sub={openAlerts+" require action"} trend="down" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Panel>
          <SectionTitle>Monthly revenue vs target</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY_REV} margin={{top:4,right:4,bottom:0,left:-20}}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#475569",fontSize:10}} tickFormatter={v=>fmtM(v)} axisLine={false} tickLine={false}/>
              <Tooltip content={<DarkTip />} />
              <Area type="monotone" dataKey="actual" name="Actual" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="target" name="Target" stroke="#475569" strokeDasharray="4 4" strokeWidth={1.5} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel>
          <SectionTitle>Daily transactions — last 7 days</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={DAILY_7} margin={{top:4,right:4,bottom:0,left:-20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<DarkTip />} />
              <Bar dataKey="tx" name="Transactions" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel>
        <SectionTitle>Park revenue snapshot</SectionTitle>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #1e293b" }}>
                {["Park","YTD Revenue","Target","vs Target","Visitors","Capture Rate","Avg Tx Time"].map(h=>(
                  <th key={h} style={{ padding:"7px 10px", color:"#475569", fontWeight:700,
                    fontSize:10, textTransform:"uppercase", letterSpacing:"0.05em", textAlign:"left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PARK_PERF.map((p,i)=>{
                const diff = parseFloat(pct(p.rev,p.target));
                return (
                  <tr key={p.park} style={{ borderBottom:"1px solid #1e293b",
                    background: i%2===0?"transparent":"rgba(255,255,255,0.01)" }}>
                    <td style={{ padding:"8px 10px", color:"#e2e8f0", fontWeight:700 }}>{p.park}</td>
                    <td style={{ padding:"8px 10px", color:"#4ade80", fontWeight:700 }}>{fmtBig(p.rev)}</td>
                    <td style={{ padding:"8px 10px", color:"#64748b" }}>{fmtBig(p.target)}</td>
                    <td style={{ padding:"8px 10px" }}>
                      <span style={{ color: diff>=0?"#22c55e":"#f87171", fontWeight:700 }}>
                        {diff>=0?"↑":"↓"}{Math.abs(diff)}%
                      </span>
                    </td>
                    <td style={{ padding:"8px 10px", color:"#cbd5e1" }}>{p.visitors.toLocaleString()}</td>
                    <td style={{ padding:"8px 10px" }}>
                      <span style={{ color: p.captureRate>=99?"#22c55e":p.captureRate>=98?"#fbbf24":"#f87171", fontWeight:700 }}>
                        {p.captureRate}%
                      </span>
                    </td>
                    <td style={{ padding:"8px 10px" }}>
                      <span style={{ color: p.avgTime<=10?"#22c55e":"#f87171", fontWeight:700 }}>
                        {p.avgTime}s
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Revenue() {
  const [range, setRange] = useState("monthly");
  const data = range === "monthly" ? MONTHLY_REV : DAILY_7;
  const totalRev = MONTHLY_REV.reduce((s,m)=>s+m.actual,0);
  const totalTarget = MONTHLY_REV.reduce((s,m)=>s+m.target,0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        <StatBox label="YTD Revenue"        value={fmtBig(totalRev)}   sub="↑ 14.2% vs 2025"  trend="up" accent />
        <StatBox label="YTD Target"         value={fmtBig(totalTarget)} sub="94.3% achieved" trend="up" />
        <StatBox label="Projected annual"   value="UGX 5.12B"           sub="At current run rate" />
      </div>

      <Panel>
        <SectionTitle>
          Revenue trend
          <div style={{ display:"flex", gap:6 }}>
            {["monthly","weekly"].map(r=>(
              <button key={r} onClick={()=>setRange(r)} style={{
                fontSize:11, padding:"4px 12px", borderRadius:20, cursor:"pointer", fontWeight:700,
                border: range===r ? "1px solid #22c55e" : "1px solid #334155",
                background: range===r ? "#14532d" : "transparent",
                color: range===r ? "#4ade80" : "#64748b" }}>
                {r==="monthly"?"Monthly":"Daily (7d)"}
              </button>
            ))}
          </div>
        </SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{top:4,right:4,bottom:0,left:0}}>
            <defs>
              <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey={range==="monthly"?"month":"day"} tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"#475569",fontSize:10}} tickFormatter={v=>typeof v==="number"&&v>1000?fmtM(v):v} axisLine={false} tickLine={false}/>
            <Tooltip content={<DarkTip />} />
            <Area type="monotone" dataKey="actual" name="Revenue" stroke="#22c55e" fill="url(#aG)" strokeWidth={2.5} dot={false}/>
            {range==="monthly" && <Line type="monotone" dataKey="target" name="Target" stroke="#475569" strokeDasharray="5 5" strokeWidth={1.5} dot={false}/>}
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Panel>
          <SectionTitle>Revenue by park (UGX M)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PARK_PERF.map(p=>({...p,revM:Math.round(p.rev/1e6)}))} layout="vertical" margin={{top:0,right:10,bottom:0,left:60}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false}/>
              <XAxis type="number" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="park" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false} width={60}/>
              <Tooltip content={<DarkTip />} />
              <Bar dataKey="revM" name="Revenue (M)" fill="#3b82f6" radius={[0,4,4,0]}>
                {PARK_PERF.map((p,i)=>(
                  <Cell key={i} fill={p.rev>=p.target?"#22c55e":"#f87171"}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel>
          <SectionTitle>Monthly visitor count</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY_REV} margin={{top:4,right:4,bottom:0,left:-20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<DarkTip />} />
              <Line type="monotone" dataKey="visitors" name="Visitors" stroke="#f59e0b" strokeWidth={2.5} dot={{fill:"#f59e0b",r:3}} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

function Parks() {
  const [sort, setSort] = useState("rev");
  const sorted = [...PARK_PERF].sort((a,b)=>b[sort]-a[sort]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Panel>
        <SectionTitle>
          Park-by-park performance
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <span style={{ fontSize:11, color:"#475569" }}>Sort by:</span>
            {[["rev","Revenue"],["visitors","Visitors"],["captureRate","Capture %"],["avgTime","Tx time"]].map(([k,l])=>(
              <button key={k} onClick={()=>setSort(k)} style={{
                fontSize:11, padding:"3px 10px", borderRadius:20, cursor:"pointer", fontWeight:700,
                border: sort===k ? "1px solid #3b82f6" : "1px solid #334155",
                background: sort===k ? "#0c1a2e" : "transparent",
                color: sort===k ? "#60a5fa" : "#64748b" }}>{l}</button>
            ))}
          </div>
        </SectionTitle>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {sorted.map((p,i)=>{
            const diff = parseFloat(pct(p.rev,p.target));
            const barW = Math.round(p.rev/Math.max(...PARK_PERF.map(x=>x.rev))*100);
            return (
              <div key={p.park} style={{ background:"#0a0f1a", border:"1px solid #1e293b",
                borderRadius:10, padding:"12px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:11, fontWeight:800, color:"#475569", width:18 }}>#{i+1}</span>
                    <span style={{ fontSize:13, fontWeight:800, color:"#e2e8f0" }}>{p.park}</span>
                    <Chip label={`${p.gates} gates`} color="blue" />
                  </div>
                  <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                    <span style={{ fontSize:12, color:"#4ade80", fontWeight:800 }}>{fmtBig(p.rev)}</span>
                    <span style={{ fontSize:11, color:diff>=0?"#22c55e":"#f87171", fontWeight:700 }}>
                      {diff>=0?"↑":"↓"}{Math.abs(diff)}%
                    </span>
                    <span style={{ fontSize:11, color: p.captureRate>=99?"#22c55e":"#fbbf24", fontWeight:700 }}>
                      {p.captureRate}% capture
                    </span>
                    <span style={{ fontSize:11, color: p.avgTime<=10?"#22c55e":"#f87171", fontWeight:700 }}>
                      {p.avgTime}s avg
                    </span>
                  </div>
                </div>
                <div style={{ height:5, background:"#1e293b", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ width:`${barW}%`, height:"100%", borderRadius:3,
                    background: diff>=0?"#22c55e":"#3b82f6", transition:"width 0.4s" }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
                  <span style={{ fontSize:10, color:"#475569" }}>{p.visitors.toLocaleString()} visitors YTD</span>
                  <span style={{ fontSize:10, color:"#475569" }}>Target: {fmtBig(p.target)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

const GATES_DATA = [
  {gate:"Kichumbanyobo",park:"Murchison",status:"online",tx:312,rev:27400000,avgTime:7.8,cashPct:4,uptime:99.8},
  {gate:"Tangi",        park:"Murchison",status:"online",tx:198,rev:17200000,avgTime:8.1,cashPct:5,uptime:99.6},
  {gate:"Katunguru",    park:"Queen Eliz",status:"online",tx:267,rev:22100000,avgTime:8.2,cashPct:5,uptime:99.9},
  {gate:"Ishasha",      park:"Queen Eliz",status:"degraded",tx:89,rev:7400000,avgTime:14.2,cashPct:24,uptime:87.3},
  {gate:"Buhoma",       park:"Bwindi",   status:"online",tx:148,rev:42000000,avgTime:9.1,cashPct:3,uptime:99.7},
  {gate:"Nkuringo",     park:"Bwindi",   status:"online",tx:112,rev:31800000,avgTime:9.4,cashPct:4,uptime:99.4},
  {gate:"Main Gate",    park:"Kidepo",   status:"offline",tx:0,rev:0,avgTime:0,cashPct:100,uptime:54.1},
  {gate:"Apoka",        park:"Kidepo",   status:"degraded",tx:34,rev:2900000,avgTime:18.6,cashPct:41,uptime:71.2},
  {gate:"Main Gate",    park:"Lake Mburo",status:"online",tx:97,rev:6800000,avgTime:7.4,cashPct:6,uptime:99.5},
  {gate:"Nyakalengija", park:"Rwenzori", status:"online",tx:78,rev:5400000,avgTime:8.9,cashPct:7,uptime:98.8},
  {gate:"Main Gate",    park:"Mgahinga", status:"online",tx:64,rev:18200000,avgTime:9.6,cashPct:5,uptime:99.2},
  {gate:"Sasa",         park:"Mt Elgon", status:"online",tx:52,rev:3600000,avgTime:8.1,cashPct:8,uptime:98.6},
];

function Gates() {
  const online   = GATES_DATA.filter(g=>g.status==="online").length;
  const degraded = GATES_DATA.filter(g=>g.status==="degraded").length;
  const offline  = GATES_DATA.filter(g=>g.status==="offline").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        <StatBox label="Gates online"   value={online}   sub="of 12 active" accent />
        <StatBox label="Degraded"       value={degraded} sub="Connectivity issues" />
        <StatBox label="Offline"        value={offline}  sub="No telemetry" />
        <StatBox label="Avg uptime"     value="95.2%"    sub="Target ≥ 99%" />
      </div>

      <Panel>
        <SectionTitle>Gate telemetry — today</SectionTitle>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #1e293b" }}>
                {["Gate","Park","Status","Tx today","Revenue today","Avg time","Cash %","Uptime"].map(h=>(
                  <th key={h} style={{ padding:"7px 10px", color:"#475569", fontWeight:700,
                    fontSize:10, textTransform:"uppercase", letterSpacing:"0.05em", textAlign:"left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GATES_DATA.map((g,i)=>(
                <tr key={g.gate+g.park} style={{ borderBottom:"1px solid #1e293b",
                  background: g.status!=="online" ? "rgba(239,68,68,0.04)" : i%2===0?"transparent":"rgba(255,255,255,0.01)" }}>
                  <td style={{ padding:"8px 10px", color:"#e2e8f0", fontWeight:700 }}>{g.gate}</td>
                  <td style={{ padding:"8px 10px", color:"#94a3b8" }}>{g.park}</td>
                  <td style={{ padding:"8px 10px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:7, height:7, borderRadius:"50%",
                        background: g.status==="online"?"#22c55e":g.status==="degraded"?"#f59e0b":"#ef4444" }}/>
                      <span style={{ fontSize:11, fontWeight:700,
                        color: g.status==="online"?"#22c55e":g.status==="degraded"?"#fbbf24":"#f87171" }}>
                        {g.status==="online"?"Online":g.status==="degraded"?"Degraded":"Offline"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding:"8px 10px", color:"#cbd5e1", fontWeight:700 }}>{g.tx>0?g.tx:"—"}</td>
                  <td style={{ padding:"8px 10px", color:"#4ade80", fontWeight:700 }}>{g.rev>0?fmtBig(g.rev):"—"}</td>
                  <td style={{ padding:"8px 10px" }}>
                    <span style={{ color: g.avgTime===0?"#475569":g.avgTime<=10?"#22c55e":"#f87171", fontWeight:700 }}>
                      {g.avgTime>0?g.avgTime+"s":"—"}
                    </span>
                  </td>
                  <td style={{ padding:"8px 10px" }}>
                    <span style={{ color: g.cashPct<=10?"#22c55e":g.cashPct<=20?"#fbbf24":"#f87171", fontWeight:700 }}>
                      {g.cashPct}%
                    </span>
                  </td>
                  <td style={{ padding:"8px 10px" }}>
                    <span style={{ color: g.uptime>=99?"#22c55e":g.uptime>=90?"#fbbf24":"#f87171", fontWeight:700 }}>
                      {g.uptime}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Anomalies() {
  const [filter, setFilter] = useState("all");
  const list = filter==="all" ? ANOMALIES : ANOMALIES.filter(a=>a.status===filter||a.severity===filter);
  const open = ANOMALIES.filter(a=>a.status==="open").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        <StatBox label="Open anomalies"    value={open}    sub="Need action"    accent={open>0} />
        <StatBox label="High severity"     value={ANOMALIES.filter(a=>a.severity==="high").length}   sub="Critical" />
        <StatBox label="Resolved (30d)"    value={ANOMALIES.filter(a=>a.status==="resolved").length} sub="Cleared" />
        <StatBox label="Est. leakage risk" value="UGX 4.2M" sub="Under review" />
      </div>

      <Panel>
        <SectionTitle>
          Anomaly log
          <div style={{ display:"flex", gap:6 }}>
            {["all","open","resolved","high","medium","low"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{
                fontSize:11, padding:"3px 10px", borderRadius:20, cursor:"pointer", fontWeight:700,
                border: filter===f ? "1px solid #f59e0b" : "1px solid #334155",
                background: filter===f ? "#2a1d08" : "transparent",
                color: filter===f ? "#fbbf24" : "#64748b" }}>{f}</button>
            ))}
          </div>
        </SectionTitle>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {list.map(a=>{
            const sc = S.severity[a.severity];
            const stc = S.status[a.status];
            return (
              <div key={a.id} style={{ border:`1px solid ${sc.dot}22`, borderRadius:10,
                background:sc.bg, padding:"12px 16px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:sc.dot, flexShrink:0, marginTop:3 }}/>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                        <span style={{ fontSize:13, fontWeight:800, color:"#e2e8f0" }}>{a.type}</span>
                        <span style={{ fontSize:10, fontFamily:"monospace", color:"#475569" }}>{a.id}</span>
                      </div>
                      <div style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>
                        <span style={{ fontWeight:700, color:"#cbd5e1" }}>{a.park}</span> — {a.gate} · {a.date}
                      </div>
                      <div style={{ fontSize:12, color:"#64748b" }}>{a.detail}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5, alignItems:"flex-end", flexShrink:0 }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20,
                      background:sc.bg, color:sc.text, border:`1px solid ${sc.dot}44` }}>
                      {a.severity.toUpperCase()}
                    </span>
                    <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20,
                      background:stc.bg, color:stc.text }}>
                      {a.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <SectionTitle>Revenue assurance summary</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          {[
            {label:"Cash > 15% threshold gates",value:"2",note:"Ishasha, Kidepo Apoka",color:"red"},
            {label:"Offline sync gaps today",value:"1",note:"Kidepo Main — 4 min",color:"amber"},
            {label:"Capture rate below SLA",value:"2",note:"Kidepo (97.2%), Mt Elgon (98.8%)",color:"amber"},
          ].map(r=>(
            <div key={r.label} style={{ background:"#0a0f1a", border:"1px solid #1e293b", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:22, fontWeight:800, color: r.color==="red"?"#f87171":"#fbbf24", marginBottom:4 }}>{r.value}</div>
              <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginBottom:3 }}>{r.label}</div>
              <div style={{ fontSize:11, color:"#475569" }}>{r.note}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Payments() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {PAYMENT_MIX.map(p=>(
          <div key={p.name} style={{ background:"#0f172a", border:`1px solid ${p.color}33`,
            borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:11, color:"#475569", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>{p.name}</div>
            <div style={{ fontSize:28, fontWeight:800, color:p.color }}>{p.value}%</div>
            <div style={{ height:3, background:"#1e293b", borderRadius:2, marginTop:8 }}>
              <div style={{ width:`${p.value}%`, height:"100%", borderRadius:2, background:p.color }}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Panel>
          <SectionTitle>Payment method split</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={PAYMENT_MIX} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={55} outerRadius={90} paddingAngle={3}>
                {PAYMENT_MIX.map((p,i)=>(
                  <Cell key={i} fill={p.color} stroke="transparent"/>
                ))}
              </Pie>
              <Tooltip contentStyle={{ background:"#1e293b", border:"1px solid #334155",
                borderRadius:8, color:"#f1f5f9", fontSize:12 }} />
              <Legend iconType="circle" iconSize={8}
                formatter={v=><span style={{ color:"#94a3b8", fontSize:11 }}>{v}</span>}/>
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel>
          <SectionTitle>YTD payment channel revenue (UGX M)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={PAYMENT_MIX.map(p=>({
              name:p.name, rev:Math.round(PARK_PERF.reduce((s,x)=>s+x.rev,0)*p.value/100/1e6), color:p.color
            }))} margin={{top:4,right:4,bottom:0,left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="name" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:"#1e293b", border:"1px solid #334155",
                borderRadius:8, color:"#f1f5f9", fontSize:12 }}/>
              <Bar dataKey="rev" name="Revenue (M)" radius={[5,5,0,0]}>
                {PAYMENT_MIX.map((p,i)=><Cell key={i} fill={p.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel>
        <SectionTitle>Transaction speed by payment method</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            {method:"RFID",  time:"6.2s", note:"Fully automated — target met ✓", color:"#f59e0b"},
            {method:"Mobile Money", time:"8.7s", note:"QR + confirmation — target met ✓", color:"#22c55e"},
            {method:"Card",  time:"9.4s", note:"POS tap — within 10s SLA ✓", color:"#3b82f6"},
            {method:"Cash",  time:"142s", note:"Manual — legacy Tier 1 only ⚠", color:"#94a3b8"},
          ].map(r=>(
            <div key={r.method} style={{ background:"#0a0f1a", border:"1px solid #1e293b", borderRadius:10, padding:"14px" }}>
              <div style={{ fontSize:11, color:"#475569", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" }}>{r.method}</div>
              <div style={{ fontSize:26, fontWeight:800, color:r.color }}>{r.time}</div>
              <div style={{ fontSize:11, color:"#475569", marginTop:5 }}>{r.note}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Export() {
  const [exporting, setExporting] = useState(null);
  const [exported, setExported] = useState([]);

  const doExport = (name) => {
    setExporting(name);
    setTimeout(() => {
      setExporting(null);
      setExported(e => [...e, name]);
    }, 1200);
  };

  const REPORTS = [
    { id:"full_rev",    label:"Full revenue report",        desc:"All parks · All gates · YTD · UGX",         fmt:"CSV",  size:"~124 KB" },
    { id:"park_perf",   label:"Park performance summary",   desc:"KPIs, targets, capture rates per park",      fmt:"CSV",  size:"~8 KB"  },
    { id:"gate_tx",     label:"Gate transaction log",       desc:"Every transaction with timestamp & method",  fmt:"CSV",  size:"~2.4 MB"},
    { id:"anomaly_log", label:"Anomaly & audit log",        desc:"Flagged events, severity, resolution status",fmt:"CSV",  size:"~32 KB" },
    { id:"payment_mix", label:"Payment channel breakdown",  desc:"By method, by park, by month",               fmt:"CSV",  size:"~16 KB" },
    { id:"visitors",    label:"Visitor statistics",         desc:"Nationality, category, park, date",          fmt:"CSV",  size:"~88 KB" },
  ];

  const POLICY_POINTS = [
    { icon:"🏆", title:"RFID + ANPR scale-up",
      body:"Pilot at Murchison & Queen Elizabeth has demonstrated <10s average transaction time, validating a full ANPR-assisted Tier 2 roll-out to all 41 gates by Q1 2027." },
    { icon:"📶", title:"Offline resilience investment",
      body:"Kidepo and Bwindi experience daily 4G drops reverting 100% of transactions to cash. Recommend Starlink VSAT backup at 8 remote gates (est. UGX 184M capex)." },
    { icon:"💰", title:"Revenue leakage elimination",
      body:"Cash share at 6% system-wide vs. 100% pre-deployment. Residual risk concentrated at 2 degraded gates. Full electronic capture projects additional UGX 3.9M annually." },
    { icon:"📊", title:"Dynamic capacity management",
      body:"Real-time visitor data now enables diversion of overflow from Kasenyi plains to Ishasha gate. Recommend dashboard integration with UWA ranger dispatch system." },
    { icon:"🌍", title:"East Africa integration",
      body:"Kenya (KWS RFID) and Rwanda (RDB e-permit) use compatible ISO 15693 tag standards. A reciprocal tag-recognition agreement would reduce friction for regional tourists." },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Panel>
        <SectionTitle>Export reports</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {REPORTS.map(r=>(
            <div key={r.id} style={{ background:"#0a0f1a", border:"1px solid #1e293b", borderRadius:10, padding:"12px 14px",
              display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{r.label}</div>
                <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>{r.desc}</div>
                <div style={{ display:"flex", gap:6, marginTop:5 }}>
                  <Chip label={r.fmt}  color="blue" />
                  <Chip label={r.size} color="gray" />
                </div>
              </div>
              <button onClick={()=>doExport(r.id)} style={{
                background: exported.includes(r.id) ? "#14532d" : "#1e293b",
                border: exported.includes(r.id) ? "1px solid #166534" : "1px solid #334155",
                color: exported.includes(r.id) ? "#4ade80" : "#94a3b8",
                borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap",
                minWidth:84 }}>
                {exporting===r.id ? "..." : exported.includes(r.id) ? "✓ Done" : "↓ Export"}
              </button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionTitle>
          Policy brief — scale-up recommendations
          <Chip label="UWA BOARD · MAY 2026" color="amber"/>
        </SectionTitle>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {POLICY_POINTS.map((p,i)=>(
            <div key={i} style={{ display:"flex", gap:12, padding:"12px 14px",
              background:"#0a0f1a", border:"1px solid #1e293b", borderRadius:10, alignItems:"flex-start" }}>
              <div style={{ fontSize:22, flexShrink:0 }}>{p.icon}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color:"#e2e8f0", marginBottom:4 }}>{p.title}</div>
                <div style={{ fontSize:12, color:"#64748b", lineHeight:1.6 }}>{p.body}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:14, padding:"10px 14px", background:"#0c1a2e",
          border:"1px solid #1e3a5f", borderRadius:10, fontSize:12, color:"#60a5fa" }}>
          📄 Full policy brief available for export above. Prepared for UWA Board of Trustees review — May 2026.
        </div>
      </Panel>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════ */
export default function AdminReports() {
  const [view, setView] = useState("overview");

  const VIEWS = {
    overview:  <Overview />,
    revenue:   <Revenue />,
    parks:     <Parks />,
    gates:     <Gates />,
    anomalies: <Anomalies />,
    payments:  <Payments />,
    export:    <Export />,
  };

  return (
    <div style={{ display:"flex", fontFamily:"'DM Mono', 'IBM Plex Mono', 'Courier New', monospace",
      background:"#030712", borderRadius:14, overflow:"hidden",
      border:"1px solid #1e293b", minHeight:580 }}>

      {/* SIDEBAR */}
      <div style={{ width:198, background:"#080f1e", borderRight:"1px solid #1e293b",
        display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid #1e293b" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:6, background:"#14532d",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⬡</div>
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:"#e2e8f0", letterSpacing:"0.04em" }}>UWA REPORTS</div>
              <div style={{ fontSize:10, color:"#475569" }}>Admin console</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:10, fontSize:10 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e",
              boxShadow:"0 0 5px #22c55e" }}/>
            <span style={{ color:"#22c55e", fontWeight:700 }}>LIVE</span>
            <span style={{ color:"#334155" }}>· syncing</span>
          </div>
        </div>

        <div style={{ flex:1, padding:"10px 0" }}>
          {SIDEBAR_ITEMS.map(item=>(
            <button key={item.id} onClick={()=>setView(item.id)} style={{
              display:"flex", alignItems:"center", gap:10, width:"100%",
              padding:"9px 16px", background:"transparent", border:"none", cursor:"pointer", textAlign:"left",
              borderLeft: view===item.id ? "3px solid #22c55e" : "3px solid transparent" }}>
              <span style={{ fontSize:14, color: view===item.id ? "#22c55e" : "#334155", fontWeight:800 }}>{item.icon}</span>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.03em",
                color: view===item.id ? "#e2e8f0" : "#475569" }}>{item.label}</span>
              {item.id==="anomalies" && (
                <span style={{ marginLeft:"auto", background:"#ef4444", color:"#fff",
                  fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:10 }}>2</span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding:"12px 16px", borderTop:"1px solid #1e293b" }}>
          <div style={{ fontSize:10, color:"#334155", marginBottom:3 }}>Logged in as</div>
          <div style={{ fontSize:11, fontWeight:700, color:"#64748b" }}>UWA Admin</div>
          <div style={{ fontSize:10, color:"#1e293b", marginTop:2 }}>May 10 · 2026</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, padding:20, background:"#030712", overflowY:"auto", maxHeight:640 }}>
        {/* topbar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.01em" }}>
              {SIDEBAR_ITEMS.find(s=>s.id===view)?.label}
            </div>
            <div style={{ fontSize:11, color:"#334155", marginTop:2 }}>
              Uganda Wildlife Authority · National Parks Revenue System
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ fontSize:11, color:"#334155", background:"#0f172a",
              border:"1px solid #1e293b", borderRadius:8, padding:"6px 12px" }}>
              FY 2025 – 2026
            </div>
            <div style={{ fontSize:11, color:"#22c55e", background:"#0d2016",
              border:"1px solid #166534", borderRadius:8, padding:"6px 12px", fontWeight:700 }}>
              ● All 9 parks
            </div>
          </div>
        </div>

        {VIEWS[view]}
      </div>
    </div>
  );
}
