import { useState, useEffect } from "react";

const PARKS = [
  { name: "Murchison Falls NP — Kichumbanyobo", cat: "Ap", short: "Murchison Falls" },
  { name: "Queen Elizabeth NP — Katunguru Gate", cat: "A",  short: "Queen Elizabeth" },
  { name: "Bwindi NP — Buhoma Gate",             cat: "A",  short: "Bwindi" },
  { name: "Kidepo Valley NP — Apoka Gate",       cat: "A",  short: "Kidepo Valley" },
  { name: "Rwenzori NP — Nyakalengija Gate",     cat: "A",  short: "Rwenzori" },
  { name: "Mgahinga NP — Main Gate",             cat: "A",  short: "Mgahinga" },
  { name: "Lake Mburo NP — Main Gate",           cat: "B",  short: "Lake Mburo" },
  { name: "Mt Elgon NP — Sasa Gate",             cat: "B",  short: "Mt Elgon" },
  { name: "Semuliki NP — Main Gate",             cat: "B",  short: "Semuliki" },
];

const FEES = {
  Ap: {
    visitor:  [166500, 111000, 20000, 10000],
    vehicle: { saloon: { local: 20000, ea: 55000, foreign: 148000 }, minibus: { local: 30000, ea: 74000, foreign: 185000 }, bus: { local: 40000, ea: 111000, foreign: 222000 } },
  },
  A: {
    visitor:  [148000, 111000, 20000, 10000],
    vehicle: { saloon: { local: 20000, ea: 55000, foreign: 148000 }, minibus: { local: 30000, ea: 74000, foreign: 185000 }, bus: { local: 40000, ea: 111000, foreign: 222000 } },
  },
  B: {
    visitor:  [74000, 55500, 10000, 5000],
    vehicle: { saloon: { local: 10000, ea: 27750, foreign: 74000 }, minibus: { local: 15000, ea: 37000, foreign: 92500 }, bus: { local: 20000, ea: 55500, foreign: 111000 } },
  },
};

const VISITOR_CATS = ["Foreign non-resident", "Foreign resident", "EA citizen (adult)", "EA citizen (child)"];
const PAY_LABELS = { mm: "Mobile money", card: "Card (POS)", rfid: "RFID tag", cash: "Cash" };

function fmt(n) {
  return "UGX " + Math.round(n).toLocaleString();
}

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-UG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{t}</span>;
}

function QRMock({ seed }) {
  const cells = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const on = r < 2 || r > 4 || c < 2 || c > 4 || ((r * 7 + c + seed) % 3 === 0);
      cells.push(<div key={`${r}-${c}`} style={{ width: 9, height: 9, background: on ? "#085041" : "transparent" }} />);
    }
  }
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 9px)", gap: 1, justifyContent: "center", margin: "0 auto" }}>{cells}</div>;
}

function Receipt({ data, onClose }) {
  const { plate, park, pax, visitorLines, vehicleFee, visitorTotal, total, payMethod, ref, time } = data;
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(8,80,65,0.88)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, zIndex: 20 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, width: 270, color: "#1a1a18", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#085041", letterSpacing: "0.04em" }}>UGANDA WILDLIFE AUTHORITY</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>Entry Receipt</div>
          <div style={{ fontSize: 11, color: "#5F5E5A", marginTop: 2 }}>{park}</div>
        </div>
        <div style={{ borderTop: "1px dashed #ccc", margin: "10px 0" }} />
        {[["Plate", plate], ["Date & time", time], ["Visitors", `${pax} pax`], ["Payment", PAY_LABELS[payMethod]]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0" }}>
            <span style={{ color: "#888" }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
        <div style={{ borderTop: "1px dashed #ccc", margin: "10px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0" }}>
          <span style={{ color: "#888" }}>Vehicle fee</span><span style={{ fontWeight: 600 }}>{fmt(vehicleFee)}</span>
        </div>
        {visitorLines.map((l, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0" }}>
            <span style={{ color: "#888" }}>{l.label}</span><span style={{ fontWeight: 600 }}>{fmt(l.amount)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, borderTop: "1px solid #ccc", padding: "8px 0 4px", marginTop: 6 }}>
          <span>Total paid</span><span style={{ color: "#085041" }}>{fmt(total)}</span>
        </div>
        <div style={{ fontSize: 10, color: "#888", textAlign: "center", margin: "6px 0" }}>Ref: {ref}</div>
        <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, color: "#888", background: "#f5f5f3", borderRadius: 4, padding: "5px 8px", textAlign: "center", marginBottom: 12 }}>| ||| | || ||| | || ||| |</div>
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#1D9E75", marginBottom: 12 }}>✓ Gate opened — safe journey!</div>
        <button onClick={onClose} style={{ background: "#085041", color: "#E1F5EE", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" }}>
          New transaction
        </button>
      </div>
    </div>
  );
}

export default function GatePOS() {
  const [parkIdx, setParkIdx] = useState(0);
  const [plate, setPlate] = useState("");
  const [regType, setRegType] = useState("local");
  const [vehClass, setVehClass] = useState("saloon");
  const [qty, setQty] = useState([0, 0, 0, 0]);
  const [payMethod, setPayMethod] = useState("mm");
  const [mmNet, setMmNet] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [txCount, setTxCount] = useState(312);
  const [gateRev, setGateRev] = useState(27400000);
  const [online, setOnline] = useState(true);

  const park = PARKS[parkIdx];
  const fees = FEES[park.cat];
  const vehicleFee = fees.vehicle[vehClass][regType] || 0;
  const visitorTotal = qty.reduce((s, q, i) => s + q * fees.visitor[i], 0);
  const total = vehicleFee + visitorTotal;
  const pax = qty.reduce((a, b) => a + b, 0);

  const adj = (i, d) => setQty(q => { const n = [...q]; n[i] = Math.max(0, n[i] + d); return n; });

  const processPayment = () => {
    if (total === 0) return;
    const ref = "UWA-" + Date.now().toString(36).toUpperCase().slice(-8);
    const now = new Date().toLocaleString("en-UG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const lines = qty.map((q, i) => q > 0 ? { label: `${VISITOR_CATS[i]} ×${q}`, amount: fees.visitor[i] * q } : null).filter(Boolean);
    setReceipt({ plate: plate || "(no plate)", park: park.short, pax, visitorLines: lines, vehicleFee, visitorTotal, total, payMethod, ref, time: now });
    setTxCount(c => c + 1);
    setGateRev(r => r + total);
  };

  const closeReceipt = () => {
    setReceipt(null);
    setQty([0, 0, 0, 0]);
    setPlate("");
  };

  const s = {
    wrap: { position: "relative", fontFamily: "system-ui, sans-serif", fontSize: 13 },
    pos: { display: "grid", gridTemplateColumns: "1fr 290px", border: "0.5px solid #d0cfc7", borderRadius: 12, overflow: "hidden", background: "#fafaf8" },
    left: { padding: 16, borderRight: "0.5px solid #d0cfc7", display: "flex", flexDirection: "column", gap: 14, background: "#fff" },
    right: { padding: 16, background: "#f5f4f0", display: "flex", flexDirection: "column", gap: 12 },
    topbar: { background: "#085041", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    label: { fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 },
    input: { fontSize: 13, padding: "7px 10px", borderRadius: 8, border: "0.5px solid #d0cfc7", background: "#fff", color: "#1a1a18", width: "100%", outline: "none" },
    select: { fontSize: 13, padding: "7px 10px", borderRadius: 8, border: "0.5px solid #d0cfc7", background: "#fff", color: "#1a1a18", width: "100%", outline: "none" },
    vtHead: { display: "grid", gridTemplateColumns: "1fr 110px 80px 100px", background: "#f5f4f0", padding: "7px 12px", fontSize: 11, color: "#888", fontWeight: 600, borderBottom: "0.5px solid #e0dfd7" },
    vtRow: { display: "grid", gridTemplateColumns: "1fr 110px 80px 100px", padding: "8px 12px", borderBottom: "0.5px solid #e0dfd7", alignItems: "center" },
    qtyBtn: { width: 24, height: 24, borderRadius: 5, border: "0.5px solid #d0cfc7", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#1a1a18", lineHeight: 1 },
    sumRow: { display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "0.5px solid #e0dfd7" },
    totalBox: { background: "#085041", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    processBtn: { background: total > 0 ? "#085041" : "#d0cfc7", color: total > 0 ? "#E1F5EE" : "#888", border: "none", borderRadius: 8, padding: 13, fontSize: 14, fontWeight: 600, cursor: total > 0 ? "pointer" : "not-allowed", width: "100%", marginTop: "auto" },
    pmBtn: (p) => ({ border: payMethod === p ? "2px solid #1D9E75" : "0.5px solid #d0cfc7", borderRadius: 8, padding: "10px 6px", cursor: "pointer", background: payMethod === p ? "#E1F5EE" : "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }),
    mmTab: (n) => ({ fontSize: 11, padding: "4px 12px", borderRadius: 20, border: "0.5px solid #d0cfc7", cursor: "pointer", background: mmNet === n ? "#1D9E75" : "#fff", color: mmNet === n ? "#fff" : "#888", fontWeight: 600 }),
  };

  const payIcons = { mm: "📱", card: "💳", rfid: "📡", cash: "💵" };

  return (
    <div style={s.wrap}>
      <div style={s.pos}>
        {/* LEFT */}
        <div style={s.left}>
          {/* Topbar */}
          <div style={s.topbar}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#E1F5EE" }}>{park.name}</div>
              <div style={{ fontSize: 11, color: "#9FE1CB", marginTop: 2 }}>
                Att: J. Opio &nbsp;·&nbsp; <Clock />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: online ? "#5DCAA5" : "#F09595" }} />
              <span style={{ color: online ? "#9FE1CB" : "#F09595" }}>{online ? "Online" : "Offline"}</span>
            </div>
          </div>

          {!online && (
            <div style={{ background: "#FAEEDA", border: "0.5px solid #FAC775", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#633806", display: "flex", alignItems: "center", gap: 6 }}>
              ⚠️ Network lost — offline mode. Transactions will sync on reconnect.
            </div>
          )}

          {/* Vehicle */}
          <div>
            <div style={s.label}>Vehicle details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div style={{ gridColumn: "1/3" }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 3 }}>Plate number</label>
                <input style={s.input} value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} placeholder="e.g. UG 234 C" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 3 }}>Reg. type</label>
                <select style={s.select} value={regType} onChange={e => setRegType(e.target.value)}>
                  <option value="local">Uganda</option>
                  <option value="ea">EA (KE/TZ/RW)</option>
                  <option value="foreign">Foreign</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 3 }}>Vehicle class</label>
                <select style={s.select} value={vehClass} onChange={e => setVehClass(e.target.value)}>
                  <option value="saloon">Saloon / SUV</option>
                  <option value="minibus">Minibus (≤24 pax)</option>
                  <option value="bus">Bus (25+ pax)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 3 }}>Park / Gate</label>
                <select style={s.select} value={parkIdx} onChange={e => setParkIdx(Number(e.target.value))}>
                  {PARKS.map((p, i) => <option key={i} value={i}>{p.short}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Visitors */}
          <div>
            <div style={s.label}>Visitors</div>
            <div style={{ border: "0.5px solid #e0dfd7", borderRadius: 8, overflow: "hidden" }}>
              <div style={s.vtHead}>
                <span>Category</span><span>Rate</span><span>Qty</span><span style={{ textAlign: "right" }}>Subtotal</span>
              </div>
              {VISITOR_CATS.map((cat, i) => (
                <div key={i} style={{ ...s.vtRow, background: qty[i] > 0 ? "#f0faf6" : "transparent" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#1a1a18" }}>{cat}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#888" }}>{fmt(fees.visitor[i])}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button style={s.qtyBtn} onClick={() => adj(i, -1)}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 16, textAlign: "center", color: "#1a1a18" }}>{qty[i]}</span>
                    <button style={s.qtyBtn} onClick={() => adj(i, 1)}>+</button>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, textAlign: "right", color: qty[i] > 0 ? "#085041" : "#1a1a18" }}>
                    {fmt(fees.visitor[i] * qty[i])}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div>
            <div style={s.label}>Payment method</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              {["mm", "card", "rfid", "cash"].map(p => (
                <button key={p} style={s.pmBtn(p)} onClick={() => setPayMethod(p)}>
                  <span style={{ fontSize: 20 }}>{payIcons[p]}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: payMethod === p ? "#085041" : "#888" }}>{PAY_LABELS[p]}</span>
                </button>
              ))}
            </div>

            {payMethod === "mm" && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["MTN", "Airtel"].map(n => (
                    <button key={n} style={s.mmTab(n)} onClick={() => setMmNet(n)}>{n} Money</button>
                  ))}
                </div>
                <input style={s.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="07X XXX XXXX" type="tel" />
                <div style={{ background: "#f5f4f0", borderRadius: 8, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>Visitor scan QR</div>
                  <QRMock seed={total % 127} />
                </div>
              </div>
            )}
            {payMethod === "card" && (
              <div style={{ marginTop: 10, background: "#f0f6fb", border: "0.5px solid #b5d4f4", borderRadius: 8, padding: 10, fontSize: 12, color: "#185FA5" }}>
                💳 Present POS terminal to visitor. Accepts Visa & Mastercard.
              </div>
            )}
            {payMethod === "rfid" && (
              <div style={{ marginTop: 10, background: "#faeeda", border: "0.5px solid #FAC775", borderRadius: 8, padding: 10, fontSize: 12, color: "#633806" }}>
                📡 RFID tag detected: <strong>UG-R-0044</strong> &nbsp;·&nbsp; Balance: UGX 740,000
              </div>
            )}
            {payMethod === "cash" && (
              <div style={{ marginTop: 10, background: "#f5f4f0", border: "0.5px solid #d0cfc7", borderRadius: 8, padding: 10, fontSize: 12, color: "#5F5E5A" }}>
                💵 Cash accepted (Tier 1 gate). Collect exact amount or compute change.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={s.right}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18" }}>Transaction summary</div>

          <div>
            {[
              ["Park category", `Category ${park.cat === "Ap" ? "A+" : park.cat}`],
              ["Vehicle fee", fmt(vehicleFee)],
              ["Visitor fees", fmt(visitorTotal)],
              ["Visitors", `${pax} pax`],
              ["Payment via", PAY_LABELS[payMethod]],
            ].map(([l, v]) => (
              <div key={l} style={s.sumRow}>
                <span style={{ fontSize: 12, color: "#888" }}>{l}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a18" }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={s.totalBox}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#9FE1CB" }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#E1F5EE" }}>{fmt(total)}</span>
          </div>

          <button style={s.processBtn} onClick={processPayment} disabled={total === 0}>
            ✓ &nbsp; Confirm &amp; open gate
          </button>

          {/* Today stats */}
          <div style={{ borderTop: "0.5px solid #d0cfc7", paddingTop: 12, marginTop: "auto" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>Today at this gate</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "#fff", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 10, color: "#888" }}>Transactions</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a18" }}>{txCount}</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 10, color: "#888" }}>Revenue</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#085041" }}>UGX {(gateRev / 1e6).toFixed(1)}M</div>
              </div>
            </div>
            <div style={{ marginTop: 8, background: "#fff", borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>Avg transaction time</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#1a1a18" }}>8.3</span>
                <span style={{ fontSize: 11, color: "#888" }}>sec &nbsp;·&nbsp; target ≤10s ✓</span>
              </div>
            </div>
          </div>

          {/* Offline toggle (demo) */}
          <button onClick={() => setOnline(o => !o)} style={{ fontSize: 11, color: "#888", background: "none", border: "0.5px solid #d0cfc7", borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}>
            Demo: toggle {online ? "offline" : "online"} mode
          </button>
        </div>
      </div>

      {receipt && <Receipt data={receipt} onClose={closeReceipt} />}
    </div>
  );
}
