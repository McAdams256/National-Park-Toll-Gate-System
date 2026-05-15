import { useState } from "react";

/* ─── DATA ─────────────────────────────────────────────────── */
const PARKS = [
  { id: 1, name: "Murchison Falls",    cat: "A+", region: "Northern",  img: "🦛", tagline: "Africa's most powerful waterfall" },
  { id: 2, name: "Queen Elizabeth",    cat: "A",  region: "Western",   img: "🐘", tagline: "The jewel of Uganda's parks" },
  { id: 3, name: "Bwindi Impenetrable",cat: "A",  region: "Southwest", img: "🦍", tagline: "Home of the mountain gorilla" },
  { id: 4, name: "Kidepo Valley",      cat: "A",  region: "Northeast", img: "🦁", tagline: "Uganda's wildest wilderness" },
  { id: 5, name: "Lake Mburo",         cat: "B",  region: "Western",   img: "🦓", tagline: "Zebra and hippo country" },
  { id: 6, name: "Rwenzori Mountains", cat: "A",  region: "Western",   img: "🏔️", tagline: "Mountains of the Moon" },
  { id: 7, name: "Mgahinga Gorilla",   cat: "A",  region: "Southwest", img: "🌋", tagline: "Virunga volcanoes & gorillas" },
  { id: 8, name: "Mt Elgon",           cat: "B",  region: "Eastern",   img: "🌿", tagline: "Ancient caldera & caves" },
  { id: 9, name: "Semuliki",           cat: "B",  region: "Western",   img: "🦜", tagline: "Congo Basin rainforest" },
];

const FEES = {
  "A+": { foreigner: 166500, resident: 111000, ea_adult: 20000, ea_child: 10000 },
  "A":  { foreigner: 148000, resident: 111000, ea_adult: 20000, ea_child: 10000 },
  "B":  { foreigner:  74000, resident:  55500, ea_adult: 10000, ea_child:  5000 },
};

const VEH_FEES = {
  saloon:  { local: 20000, foreign: 148000 },
  minibus: { local: 30000, foreign: 185000 },
  bus:     { local: 40000, foreign: 222000 },
};

const CAT_KEYS   = ["foreigner","resident","ea_adult","ea_child"];
const CAT_LABELS = ["Foreign non-resident","Foreign resident","EA citizen (adult)","EA citizen (child)"];

const MOCK_USER = {
  name: "Nakato Sarah",
  initials: "NS",
  email: "sarah.nakato@gmail.com",
  nationality: "Ugandan",
  memberSince: "March 2024",
  rfidBalance: 592000,
  rfidTag: "UG-R-0044",
  vehicles: [
    { plate: "UAB 412G", type: "saloon", label: "Saloon / SUV", reg: "local" },
    { plate: "UAX 771B", type: "minibus", label: "Minibus", reg: "local" },
  ],
};

const HISTORY = [
  { id: "UWA-A8F2C1", park: "Queen Elizabeth", date: "3 May 2026", amount: 168000, method: "RFID", status: "completed", pax: 2 },
  { id: "UWA-B3D9E0", park: "Lake Mburo",      date: "19 Apr 2026", amount: 40000,  method: "MTN",  status: "completed", pax: 2 },
  { id: "UWA-C1A7F4", park: "Murchison Falls", date: "2 Apr 2026",  amount: 196500, method: "Card", status: "completed", pax: 3 },
  { id: "UWA-D5B2C3", park: "Bwindi",          date: "15 Mar 2026", amount: 20000,  method: "MTN",  status: "completed", pax: 1 },
];

const fmt   = n => "UGX " + Math.round(n).toLocaleString();
const short = n => "UGX " + (n >= 1e6 ? (n/1e6).toFixed(1)+"M" : (n/1000).toFixed(0)+"k");

/* ─── TINY COMPONENTS ───────────────────────────────────────── */
function Avatar({ initials, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#1D9E75",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.36, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Badge({ children, color = "green" }) {
  const colors = {
    green:  { bg: "#E1F5EE", text: "#085041" },
    blue:   { bg: "#E6F1FB", text: "#185FA5" },
    amber:  { bg: "#FAEEDA", text: "#633806" },
    gray:   { bg: "#F1EFE8", text: "#444441" },
  };
  const c = colors[color] || colors.green;
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 600,
      padding: "3px 8px", borderRadius: 20 }}>{children}</span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #e0dfd7",
      borderRadius: 12, padding: "16px 18px", ...style }}>{children}</div>
  );
}

function StatCard({ label, value, sub, accent = false }) {
  return (
    <div style={{ background: accent ? "#085041" : "#f5f4f0", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: accent ? "#9FE1CB" : "#888", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent ? "#E1F5EE" : "#1a1a18", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: accent ? "#5DCAA5" : "#888", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/* ─── LOGIN SCREEN ───────────────────────────────────────────── */
function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const inp = (placeholder, k, type = "text") => (
    <input type={type} placeholder={placeholder} value={form[k]} onChange={set(k)}
      style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 8,
        border: "0.5px solid #d0cfc7", outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
  );
  return (
    <div style={{ minHeight: 560, display: "flex", fontFamily: "system-ui, sans-serif" }}>
      {/* left panel */}
      <div style={{ flex: 1, background: "#085041", borderRadius: "12px 0 0 12px",
        padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#1D9E75",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌿</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#E1F5EE" }}>UWA Visitor Portal</div>
              <div style={{ fontSize: 11, color: "#9FE1CB" }}>Uganda Wildlife Authority</div>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#E1F5EE", lineHeight: 1.3, marginBottom: 12 }}>
            Experience Uganda's<br />wild wonders
          </div>
          <div style={{ fontSize: 13, color: "#9FE1CB", lineHeight: 1.6, marginBottom: 24 }}>
            Book park entries, manage your RFID account, and track visits across all 41 national park gates.
          </div>
          {["10 parks · 41 gates nationwide", "Mobile money, card & RFID payments", "Instant e-receipts & booking history"].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ color: "#5DCAA5", fontSize: 14 }}>✓</span>
              <span style={{ fontSize: 12, color: "#9FE1CB" }}>{t}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#5DCAA5" }}>Secured · PCI DSS Compliant · UWA Official</div>
      </div>

      {/* right panel */}
      <div style={{ width: 320, background: "#fff", borderRadius: "0 12px 12px 0",
        padding: 28, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "0.5px solid #e0dfd7" }}>
          {["login","register"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, fontSize: 13, fontWeight: 600, padding: "8px 0 10px",
              background: "none", border: "none", cursor: "pointer",
              color: tab === t ? "#085041" : "#888",
              borderBottom: tab === t ? "2px solid #085041" : "2px solid transparent",
              marginBottom: -0.5 }}>
              {t === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>
        {tab === "login" ? (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18", marginBottom: 16 }}>Welcome back</div>
            {inp("Email address", "email", "email")}
            {inp("Password", "password", "password")}
            <button onClick={onLogin} style={{ background: "#085041", color: "#E1F5EE", border: "none",
              borderRadius: 8, padding: "11px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 12 }}>
              Sign in
            </button>
            <div style={{ textAlign: "center", fontSize: 12, color: "#888" }}>
              Demo: <button onClick={onLogin} style={{ color: "#1D9E75", background: "none", border: "none",
                cursor: "pointer", fontSize: 12, fontWeight: 600 }}>enter as Sarah Nakato →</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18", marginBottom: 16 }}>Create account</div>
            {inp("Full name", "name")}
            {inp("Email address", "email", "email")}
            {inp("Phone (MTN/Airtel)", "phone", "tel")}
            {inp("Password", "password", "password")}
            <button onClick={onLogin} style={{ background: "#085041", color: "#E1F5EE", border: "none",
              borderRadius: 8, padding: "11px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 10 }}>
              Create account
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── SIDEBAR ────────────────────────────────────────────────── */
const NAV = [
  { id: "home",    icon: "🏠", label: "Dashboard" },
  { id: "book",    icon: "🎫", label: "Book entry" },
  { id: "rfid",    icon: "📡", label: "RFID account" },
  { id: "history", icon: "📋", label: "My visits" },
  { id: "vehicles",icon: "🚗", label: "Vehicles" },
  { id: "profile", icon: "👤", label: "Profile" },
];

function Sidebar({ view, setView, user, onLogout }) {
  return (
    <div style={{ width: 200, background: "#085041", borderRadius: "12px 0 0 12px",
      display: "flex", flexDirection: "column", padding: "16px 0", flexShrink: 0 }}>
      <div style={{ padding: "0 16px 16px", borderBottom: "0.5px solid rgba(255,255,255,0.1)", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌿</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#E1F5EE" }}>UWA Portal</div>
            <div style={{ fontSize: 10, color: "#9FE1CB" }}>Visitor Account</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "9px 16px", background: view === n.id ? "rgba(255,255,255,0.12)" : "none",
            border: "none", cursor: "pointer", textAlign: "left",
            borderLeft: view === n.id ? "3px solid #5DCAA5" : "3px solid transparent" }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: view === n.id ? "#E1F5EE" : "#9FE1CB" }}>{n.label}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: "12px 16px", borderTop: "0.5px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Avatar initials={user.initials} size={30} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#E1F5EE" }}>{user.name.split(" ")[0]}</div>
            <div style={{ fontSize: 10, color: "#9FE1CB" }}>{user.nationality}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ fontSize: 11, color: "#9FE1CB", background: "none",
          border: "0.5px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", width: "100%" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ──────────────────────────────────────────────── */
function Dashboard({ user, setView }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a18" }}>Good morning, {user.name.split(" ")[0]} 👋</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Member since {user.memberSince}</div>
        </div>
        <button onClick={() => setView("book")} style={{ background: "#085041", color: "#E1F5EE", border: "none",
          borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          + Book entry
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <StatCard label="RFID balance" value={short(user.rfidBalance)} sub={user.rfidTag} accent />
        <StatCard label="Parks visited" value="6" sub="This year" />
        <StatCard label="Total visits" value="14" sub="Since " />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a18", marginBottom: 12 }}>Recent visits</div>
          {HISTORY.slice(0, 3).map(h => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "7px 0", borderBottom: "0.5px solid #f0efe7" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a18" }}>{h.park}</div>
                <div style={{ fontSize: 11, color: "#888" }}>{h.date} · {h.pax} pax</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a18" }}>{short(h.amount)}</div>
                <Badge color="green">✓ Paid</Badge>
              </div>
            </div>
          ))}
          <button onClick={() => setView("history")} style={{ marginTop: 10, fontSize: 12, color: "#1D9E75",
            background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>
            View all visits →
          </button>
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a18", marginBottom: 12 }}>Quick park access</div>
          {PARKS.slice(0, 4).map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0",
              borderBottom: "0.5px solid #f0efe7" }}>
              <span style={{ fontSize: 20 }}>{p.img}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a18" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#888" }}>{p.region} · Cat {p.cat}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#085041" }}>
                {short(FEES[p.cat].ea_adult)}
              </div>
            </div>
          ))}
          <button onClick={() => setView("book")} style={{ marginTop: 10, fontSize: 12, color: "#1D9E75",
            background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>
            Book a park →
          </button>
        </Card>
      </div>

      <Card style={{ background: "linear-gradient(135deg,#085041 60%,#1D9E75)", border: "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "#9FE1CB", fontWeight: 600, marginBottom: 4 }}>RFID TAG · {user.rfidTag}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#E1F5EE" }}>{fmt(user.rfidBalance)}</div>
            <div style={{ fontSize: 12, color: "#9FE1CB", marginTop: 2 }}>Available balance</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>📡</div>
            <button onClick={() => setView("rfid")} style={{ background: "#fff", color: "#085041", border: "none",
              borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Top up
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─── BOOK ENTRY ─────────────────────────────────────────────── */
function BookEntry({ user }) {
  const [step, setStep] = useState(1);
  const [park, setPark] = useState(null);
  const [date, setDate] = useState("");
  const [vehicle, setVehicle] = useState(user.vehicles[0]);
  const [qty, setQty] = useState({ foreigner: 0, resident: 0, ea_adult: 1, ea_child: 0 });
  const [payMethod, setPayMethod] = useState("rfid");
  const [mmNet, setMmNet] = useState("MTN");
  const [phone, setPhone] = useState("+256 ");
  const [done, setDone] = useState(false);

  const adj = (k, d) => setQty(q => ({ ...q, [k]: Math.max(0, q[k] + d) }));
  const fees = park ? FEES[park.cat] : null;
  const pax = Object.values(qty).reduce((a, b) => a + b, 0);
  const visitorTotal = fees ? CAT_KEYS.reduce((s, k) => s + qty[k] * fees[k], 0) : 0;
  const vehFee = vehicle ? VEH_FEES[vehicle.type][vehicle.reg] : 0;
  const total = visitorTotal + vehFee;

  const PAY = [
    { id: "rfid", icon: "📡", label: "RFID tag", sub: `Bal: ${short(user.rfidBalance)}`, ok: user.rfidBalance >= total },
    { id: "mm",   icon: "📱", label: "Mobile money", sub: "MTN / Airtel", ok: true },
    { id: "card", icon: "💳", label: "Card", sub: "Visa / Mastercard", ok: true },
  ];

  if (done) {
    const ref = "UWA-" + Math.random().toString(36).toUpperCase().slice(2, 10);
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🎉</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a18" }}>Booking confirmed!</div>
        <div style={{ fontSize: 13, color: "#888" }}>{park.name} · {date}</div>
        <Card style={{ width: "100%", maxWidth: 340 }}>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#085041", letterSpacing: "0.05em" }}>UGANDA WILDLIFE AUTHORITY</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>Entry Booking</div>
          </div>
          {[["Park", park.name], ["Date", date], ["Vehicle", vehicle.plate], ["Visitors", `${pax} pax`],
            ["Payment", PAY_LABELS[payMethod]], ["Total paid", fmt(total)], ["Booking ref", ref]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12,
              padding: "4px 0", borderBottom: "0.5px solid #f0efe7" }}>
              <span style={{ color: "#888" }}>{l}</span>
              <span style={{ fontWeight: 700, color: l === "Total paid" ? "#085041" : "#1a1a18" }}>{v}</span>
            </div>
          ))}
          <div style={{ textAlign: "center", fontFamily: "monospace", fontSize: 9, letterSpacing: 3,
            color: "#888", background: "#f5f4f0", borderRadius: 6, padding: "5px 8px", margin: "10px 0" }}>
            | ||| | || ||| | || ||| |
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "#888" }}>Show at gate or scan via RFID</div>
        </Card>
        <button onClick={() => { setDone(false); setStep(1); setPark(null); setDate(""); setQty({ foreigner:0,resident:0,ea_adult:1,ea_child:0 }); }}
          style={{ background: "#085041", color: "#E1F5EE", border: "none", borderRadius: 8,
            padding: "10px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Book another entry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18" }}>Book park entry</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 11, fontWeight: 700,
                background: step >= s ? "#085041" : "#f0efe7", color: step >= s ? "#fff" : "#888" }}>{s}</div>
              {s < 4 && <div style={{ width: 20, height: 1, background: step > s ? "#085041" : "#d0cfc7" }} />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Choose park */}
      {step === 1 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18", marginBottom: 12 }}>Select a park</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {PARKS.map(p => (
              <div key={p.id} onClick={() => setPark(p)} style={{ cursor: "pointer", border: park?.id === p.id ? "2px solid #1D9E75" : "0.5px solid #e0dfd7",
                borderRadius: 10, padding: "12px", background: park?.id === p.id ? "#E1F5EE" : "#fff", transition: "border-color 0.15s" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{p.img}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a18" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{p.region}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <Badge color="green">Cat {p.cat}</Badge>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#085041" }}>{short(FEES[p.cat].ea_adult)}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Visit date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ fontSize: 13, padding: "9px 12px", borderRadius: 8, border: "0.5px solid #d0cfc7",
                  background: "#fff", color: "#1a1a18", width: "100%" }} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <button onClick={() => park && date && setStep(2)} style={{ background: park && date ? "#085041" : "#d0cfc7",
              color: park && date ? "#E1F5EE" : "#888", border: "none", borderRadius: 8,
              padding: "11px 24px", fontSize: 13, fontWeight: 700, cursor: park && date ? "pointer" : "not-allowed" }}>
              Next: Add visitors →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Visitors & vehicle */}
      {step === 2 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18", marginBottom: 10 }}>
            {park.img} {park.name} · {date}
          </div>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a18", marginBottom: 10 }}>Visitor count</div>
            <div style={{ border: "0.5px solid #e0dfd7", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 100px 100px",
                background: "#f5f4f0", padding: "7px 12px", fontSize: 11, color: "#888", fontWeight: 600, borderBottom: "0.5px solid #e0dfd7" }}>
                <span>Category</span><span>Rate</span><span>Qty</span><span style={{ textAlign: "right" }}>Subtotal</span>
              </div>
              {CAT_KEYS.map((k, i) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr 110px 100px 100px",
                  padding: "8px 12px", borderBottom: i < 3 ? "0.5px solid #e0dfd7" : "none",
                  background: qty[k] > 0 ? "#f0faf6" : "transparent", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a18" }}>{CAT_LABELS[i]}</span>
                  <span style={{ fontSize: 11, color: "#888" }}>{fmt(fees[k])}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => adj(k, -1)} style={{ width: 24, height: 24, borderRadius: 5, border: "0.5px solid #d0cfc7",
                      background: "#fff", cursor: "pointer", fontSize: 15, color: "#1a1a18" }}>−</button>
                    <span style={{ fontWeight: 700, minWidth: 16, textAlign: "center", color: "#1a1a18" }}>{qty[k]}</span>
                    <button onClick={() => adj(k, 1)} style={{ width: 24, height: 24, borderRadius: 5, border: "0.5px solid #d0cfc7",
                      background: "#fff", cursor: "pointer", fontSize: 15, color: "#1a1a18" }}>+</button>
                  </div>
                  <span style={{ textAlign: "right", fontSize: 12, fontWeight: 700, color: qty[k] > 0 ? "#085041" : "#888" }}>
                    {fmt(fees[k] * qty[k])}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a18", marginBottom: 10 }}>Vehicle</div>
            <div style={{ display: "flex", gap: 8 }}>
              {user.vehicles.map(v => (
                <div key={v.plate} onClick={() => setVehicle(v)} style={{ flex: 1, border: vehicle.plate === v.plate ? "2px solid #1D9E75" : "0.5px solid #d0cfc7",
                  borderRadius: 8, padding: "10px 12px", cursor: "pointer", background: vehicle.plate === v.plate ? "#E1F5EE" : "#fff" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a18" }}>{v.plate}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{v.label} · UG reg</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#085041", marginTop: 4 }}>
                    Vehicle fee: {fmt(VEH_FEES[v.type][v.reg])}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={() => setStep(1)} style={{ background: "none", border: "0.5px solid #d0cfc7", borderRadius: 8,
              padding: "11px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#888" }}>← Back</button>
            <button onClick={() => pax > 0 && setStep(3)} style={{ background: pax > 0 ? "#085041" : "#d0cfc7",
              color: pax > 0 ? "#E1F5EE" : "#888", border: "none", borderRadius: 8,
              padding: "11px 24px", fontSize: 13, fontWeight: 700, cursor: pax > 0 ? "pointer" : "not-allowed" }}>
              Next: Payment →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Payment */}
      {step === 3 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a18", marginBottom: 12 }}>Select payment method</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PAY.map(p => (
                <div key={p.id} onClick={() => setPayMethod(p.id)} style={{ border: payMethod === p.id ? "2px solid #1D9E75" : "0.5px solid #d0cfc7",
                  borderRadius: 10, padding: "14px 16px", cursor: "pointer", background: payMethod === p.id ? "#E1F5EE" : "#fff",
                  display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a18" }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{p.sub}</div>
                  </div>
                  {!p.ok && <Badge color="amber">Low balance</Badge>}
                  {p.ok && payMethod === p.id && <span style={{ color: "#1D9E75", fontWeight: 700 }}>✓</span>}
                </div>
              ))}
            </div>
            {payMethod === "mm" && (
              <Card style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a18", marginBottom: 10 }}>Mobile money details</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {["MTN","Airtel"].map(n => (
                    <button key={n} onClick={() => setMmNet(n)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
                      border: mmNet === n ? "2px solid #1D9E75" : "0.5px solid #d0cfc7",
                      background: mmNet === n ? "#1D9E75" : "#fff", color: mmNet === n ? "#fff" : "#888", cursor: "pointer" }}>
                      {n} Money
                    </button>
                  ))}
                </div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Phone number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
                  style={{ width: "100%", fontSize: 14, padding: "9px 12px", borderRadius: 8, border: "0.5px solid #d0cfc7", outline: "none" }} />
              </Card>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a18", marginBottom: 10 }}>Order summary</div>
              {[
                ["Park", park.name],
                ["Date", date],
                ["Vehicle", `${vehicle.plate} (+${fmt(vehFee)})`],
                ...CAT_KEYS.filter(k => qty[k] > 0).map((k, i) => [`${CAT_LABELS[CAT_KEYS.indexOf(k)]} ×${qty[k]}`, fmt(FEES[park.cat][k] * qty[k])]),
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 11,
                  padding: "4px 0", borderBottom: "0.5px solid #f0efe7" }}>
                  <span style={{ color: "#888" }}>{l}</span>
                  <span style={{ fontWeight: 600, color: "#1a1a18" }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700,
                paddingTop: 8, marginTop: 4 }}>
                <span>Total</span>
                <span style={{ color: "#085041" }}>{fmt(total)}</span>
              </div>
            </Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => setStep(4)} style={{ background: "#085041", color: "#E1F5EE", border: "none",
                borderRadius: 8, padding: "12px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%" }}>
                Pay {fmt(total)} →
              </button>
              <button onClick={() => setStep(2)} style={{ background: "none", border: "0.5px solid #d0cfc7", borderRadius: 8,
                padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#888", width: "100%" }}>
                ← Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Confirm */}
      {step === 4 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "8px 0" }}>
          <div style={{ fontSize: 48 }}>🔐</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18" }}>Confirm payment</div>
          <Card style={{ width: "100%", maxWidth: 340 }}>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 28 }}>{park.img}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a18" }}>{park.name}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{date} · {pax} visitors</div>
            </div>
            <div style={{ background: "#085041", borderRadius: 8, padding: "12px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: "#9FE1CB", fontSize: 13, fontWeight: 600 }}>Amount due</span>
              <span style={{ color: "#E1F5EE", fontSize: 22, fontWeight: 700 }}>{fmt(total)}</span>
            </div>
            <div style={{ fontSize: 12, color: "#888", textAlign: "center", marginBottom: 12 }}>
              via {PAY_LABELS[payMethod]} {payMethod === "rfid" ? `· Tag ${user.rfidTag}` : payMethod === "mm" ? `· ${phone}` : ""}
            </div>
            <button onClick={() => setDone(true)} style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8,
              padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 8 }}>
              ✓ Confirm & pay
            </button>
            <button onClick={() => setStep(3)} style={{ background: "none", border: "0.5px solid #d0cfc7", borderRadius: 8,
              padding: "10px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#888", width: "100%" }}>
              ← Change payment
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─── RFID ACCOUNT ───────────────────────────────────────────── */
function RFIDAccount({ user }) {
  const [topupAmt, setTopupAmt] = useState(100000);
  const [topupNet, setTopupNet] = useState("MTN");
  const [balance, setBalance] = useState(user.rfidBalance);
  const [done, setDone] = useState(false);
  const presets = [50000, 100000, 200000, 500000];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18" }}>RFID account</div>
      <div style={{ background: "linear-gradient(135deg, #085041, #1D9E75)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 11, color: "#9FE1CB", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 4 }}>RFID TAG</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#E1F5EE", marginBottom: 2 }}>{user.rfidTag}</div>
        <div style={{ fontSize: 14, color: "#9FE1CB", marginBottom: 12 }}>Linked to {user.vehicles[0].plate}</div>
        <div style={{ display: "flex", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: "#9FE1CB" }}>Balance</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#E1F5EE" }}>{fmt(balance)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#9FE1CB" }}>Status</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#5DCAA5" }}>✓ Active</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#9FE1CB" }}>Gates cleared</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#E1F5EE" }}>14</div>
          </div>
        </div>
      </div>

      {done ? (
        <Card style={{ textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18" }}>Top-up successful!</div>
          <div style={{ fontSize: 13, color: "#888", margin: "6px 0 16px" }}>
            {fmt(topupAmt)} added · New balance: {fmt(balance)}
          </div>
          <button onClick={() => setDone(false)} style={{ background: "#085041", color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Done
          </button>
        </Card>
      ) : (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a18", marginBottom: 12 }}>Top up balance</div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Select amount</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {presets.map(p => (
              <button key={p} onClick={() => setTopupAmt(p)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                border: topupAmt === p ? "2px solid #1D9E75" : "0.5px solid #d0cfc7",
                background: topupAmt === p ? "#E1F5EE" : "#fff", color: topupAmt === p ? "#085041" : "#888", cursor: "pointer" }}>
                {short(p)}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Or enter custom amount</label>
            <input type="number" value={topupAmt} onChange={e => setTopupAmt(Number(e.target.value))}
              step={10000} min={10000}
              style={{ fontSize: 14, padding: "9px 12px", borderRadius: 8, border: "0.5px solid #d0cfc7", outline: "none", width: "100%" }} />
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Pay via</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {["MTN", "Airtel", "Card"].map(n => (
              <button key={n} onClick={() => setTopupNet(n)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
                border: topupNet === n ? "2px solid #1D9E75" : "0.5px solid #d0cfc7",
                background: topupNet === n ? "#1D9E75" : "#fff", color: topupNet === n ? "#fff" : "#888", cursor: "pointer" }}>
                {n}
              </button>
            ))}
          </div>
          <button onClick={() => { setBalance(b => b + topupAmt); setDone(true); }}
            style={{ background: "#085041", color: "#E1F5EE", border: "none", borderRadius: 8,
              padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" }}>
            Top up {fmt(topupAmt)} via {topupNet}
          </button>
        </Card>
      )}

      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a18", marginBottom: 10 }}>How RFID works at park gates</div>
        {["Drive up to the Tier 2 automated lane — no stopping required.",
          "Overhead reader scans your windshield tag in under 8 seconds.",
          "Fee is auto-deducted from your balance and barrier lifts.",
          "SMS receipt sent to your registered number instantly."].map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: i < 3 ? "0.5px solid #f0efe7" : "none" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#085041", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {i + 1}
            </div>
            <span style={{ fontSize: 12, color: "#5F5E5A", lineHeight: 1.5 }}>{t}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ─── VISIT HISTORY ──────────────────────────────────────────── */
function History() {
  const [filter, setFilter] = useState("all");
  const methods = ["all", "RFID", "MTN", "Card"];
  const list = filter === "all" ? HISTORY : HISTORY.filter(h => h.method === filter);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18" }}>My visits</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <StatCard label="Total visits" value={HISTORY.length} sub="All time" />
        <StatCard label="Total spent" value={short(HISTORY.reduce((s,h)=>s+h.amount,0))} sub="All parks" />
        <StatCard label="Parks visited" value="4" sub="Unique parks" />
      </div>
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a18" }}>Transaction history</div>
          <div style={{ display: "flex", gap: 6 }}>
            {methods.map(m => (
              <button key={m} onClick={() => setFilter(m)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20,
                border: filter === m ? "2px solid #1D9E75" : "0.5px solid #d0cfc7",
                background: filter === m ? "#1D9E75" : "#fff", color: filter === m ? "#fff" : "#888",
                fontWeight: 600, cursor: "pointer" }}>{m === "all" ? "All" : m}</button>
            ))}
          </div>
        </div>
        {list.length === 0 && <div style={{ textAlign: "center", color: "#888", fontSize: 12, padding: 20 }}>No transactions found.</div>}
        {list.map(h => (
          <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12,
            padding: "10px 0", borderBottom: "0.5px solid #f0efe7" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f0faf6", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {PARKS.find(p => p.name.startsWith(h.park.split(" ")[0]))?.img || "🏞️"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a18" }}>{h.park}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{h.date} · {h.pax} pax · {h.method}</div>
              <div style={{ fontSize: 10, color: "#aaa", fontFamily: "monospace" }}>{h.id}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#085041" }}>{fmt(h.amount)}</div>
              <Badge color="green">✓ Paid</Badge>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ─── VEHICLES ───────────────────────────────────────────────── */
function Vehicles({ user }) {
  const [adding, setAdding] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newType, setNewType] = useState("saloon");
  const [newReg, setNewReg] = useState("local");
  const [vehicles, setVehicles] = useState(user.vehicles);

  const addVehicle = () => {
    if (!newPlate) return;
    setVehicles(v => [...v, { plate: newPlate.toUpperCase(), type: newType, label: newType === "saloon" ? "Saloon / SUV" : newType === "minibus" ? "Minibus" : "Bus", reg: newReg }]);
    setAdding(false); setNewPlate(""); setNewType("saloon"); setNewReg("local");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18" }}>Vehicles</div>
        <button onClick={() => setAdding(a => !a)} style={{ background: "#085041", color: "#E1F5EE", border: "none",
          borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          + Add vehicle
        </button>
      </div>
      {vehicles.map(v => (
        <Card key={v.plate} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 36 }}>🚗</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18", letterSpacing: "0.04em" }}>{v.plate}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{v.label} · {v.reg === "local" ? "Uganda registered" : v.reg === "ea" ? "East Africa" : "Foreign"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Entry fee (saloon)</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#085041" }}>{fmt(VEH_FEES.saloon[v.reg])}</div>
          </div>
        </Card>
      ))}
      {adding && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a18", marginBottom: 12 }}>Add new vehicle</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Plate number</label>
              <input value={newPlate} onChange={e => setNewPlate(e.target.value.toUpperCase())} placeholder="UG 000 X"
                style={{ width: "100%", fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "0.5px solid #d0cfc7", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Class</label>
              <select value={newType} onChange={e => setNewType(e.target.value)}
                style={{ width: "100%", fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "0.5px solid #d0cfc7", outline: "none" }}>
                <option value="saloon">Saloon / SUV</option>
                <option value="minibus">Minibus</option>
                <option value="bus">Bus (25+)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Registration</label>
              <select value={newReg} onChange={e => setNewReg(e.target.value)}
                style={{ width: "100%", fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "0.5px solid #d0cfc7", outline: "none" }}>
                <option value="local">Uganda</option>
                <option value="ea">East Africa</option>
                <option value="foreign">Foreign</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addVehicle} style={{ background: "#085041", color: "#E1F5EE", border: "none",
              borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save vehicle</button>
            <button onClick={() => setAdding(false)} style={{ background: "none", border: "0.5px solid #d0cfc7",
              borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer", color: "#888" }}>Cancel</button>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ─── PROFILE ────────────────────────────────────────────────── */
function Profile({ user, onLogout }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18" }}>Profile</div>
      <Card style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Avatar initials={user.initials} size={52} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18" }}>{user.name}</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{user.email}</div>
          <div style={{ marginTop: 6 }}><Badge color="green">✓ Verified account</Badge></div>
        </div>
      </Card>
      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a18", marginBottom: 10 }}>Account details</div>
        {[["Nationality", user.nationality], ["Member since", user.memberSince],
          ["RFID tag", user.rfidTag], ["Linked vehicles", user.vehicles.length + " vehicles"]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderBottom: "0.5px solid #f0efe7" }}>
            <span style={{ color: "#888" }}>{l}</span>
            <span style={{ fontWeight: 600, color: "#1a1a18" }}>{v}</span>
          </div>
        ))}
      </Card>
      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a18", marginBottom: 10 }}>Notifications</div>
        {["SMS receipts after each gate entry", "Balance low alerts (below UGX 50,000)", "Booking reminders (24h before visit)"].map((t, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? "0.5px solid #f0efe7" : "none" }}>
            <span style={{ fontSize: 12, color: "#5F5E5A" }}>{t}</span>
            <div style={{ width: 36, height: 20, borderRadius: 10, background: "#1D9E75", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 3px" }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff" }} />
            </div>
          </div>
        ))}
      </Card>
      <button onClick={onLogout} style={{ background: "none", border: "0.5px solid #E24B4A", color: "#E24B4A",
        borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%" }}>
        Sign out
      </button>
    </div>
  );
}

/* ─── APP ROOT ────────────────────────────────────────────────── */
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [view, setView] = useState("home");

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  const VIEWS = {
    home:     <Dashboard user={MOCK_USER} setView={setView} />,
    book:     <BookEntry user={MOCK_USER} />,
    rfid:     <RFIDAccount user={MOCK_USER} />,
    history:  <History />,
    vehicles: <Vehicles user={MOCK_USER} />,
    profile:  <Profile user={MOCK_USER} onLogout={() => setLoggedIn(false)} />,
  };

  return (
    <div style={{ display: "flex", fontFamily: "system-ui, sans-serif", fontSize: 13,
      border: "0.5px solid #e0dfd7", borderRadius: 12, overflow: "hidden", minHeight: 560 }}>
      <Sidebar view={view} setView={setView} user={MOCK_USER} onLogout={() => setLoggedIn(false)} />
      <div style={{ flex: 1, padding: 20, background: "#fafaf8", overflowY: "auto", maxHeight: 640 }}>
        {VIEWS[view]}
      </div>
    </div>
  );
}
