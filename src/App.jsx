import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const C = {
  navy: "#1A2744", white: "#F8F7F4", blue: "#4A6FA5", sage: "#7BAE8A",
  amber: "#E8A838", grey: "#6B7280", lightGrey: "#E5E7EB", bg: "#F0F2F7",
  red: "#EF4444", purple: "#8B5CF6",
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const seedPatients = [
  { id: 1, name: "Maria Gonzalez", dob: "1985-03-14", phone: "555-0101", email: "maria@email.com", condition: "Lower back pain", visits: 8, nextAppt: "2026-06-23", insurance: "BlueCross", intakeComplete: true },
  { id: 2, name: "James Whitfield", dob: "1972-11-02", phone: "555-0202", email: "james@email.com", condition: "Cervical strain", visits: 3, nextAppt: "2026-06-25", insurance: "Aetna", intakeComplete: true },
  { id: 3, name: "Priya Nair", dob: "1990-07-28", phone: "555-0303", email: "priya@email.com", condition: "Sciatica", visits: 12, nextAppt: "2026-06-24", insurance: "UnitedHealth", intakeComplete: true },
];
const seedAppts = [
  { id: 1, patientId: 1, patientName: "Maria Gonzalez", date: "2026-06-23", time: "09:00", type: "Adjustment", status: "Confirmed", notes: "" },
  { id: 2, patientId: 3, patientName: "Priya Nair", date: "2026-06-24", time: "10:30", type: "Follow-up", status: "Confirmed", notes: "" },
  { id: 3, patientId: 2, patientName: "James Whitfield", date: "2026-06-25", time: "14:00", type: "Initial Consult", status: "Pending", notes: "" },
  { id: 4, patientId: 1, patientName: "Maria Gonzalez", date: "2026-06-26", time: "09:00", type: "Adjustment", status: "Confirmed", notes: "" },
];
const seedSOAP = {
  1: [{ date: "2026-06-10", S: "Patient reports aching in lower lumbar region, worse in the morning.", O: "ROM limited at L4-L5. Tenderness on palpation.", A: "Lumbar subluxation complex.", P: "3x/week adjustments for 4 weeks. Ice 20 min post-session." }],
  3: [{ date: "2026-06-12", S: "Radiating pain down left leg, tingling in foot.", O: "Positive SLR test at 45°. Piriformis tightness.", A: "Sciatic nerve irritation secondary to piriformis syndrome.", P: "Soft tissue work + lumbar decompression 2x/week. Home stretches." }],
};
const seedRx = {
  1: [{ date: "2026-06-10", exercises: "Cat-cow stretch x10, Child's pose 30s hold x3", frequency: "Twice daily", notes: "Avoid heavy lifting" }],
  3: [{ date: "2026-06-12", exercises: "Piriformis stretch x5 each side, Nerve flossing x10", frequency: "Once daily morning", notes: "Apply heat before stretching" }],
};
const seedInvoices = [
  { id: 1, patientId: 1, patientName: "Maria Gonzalez", date: "2026-06-10", services: [{ desc: "Chiropractic Adjustment", code: "98940", fee: 85 }], status: "Paid", insurance: "BlueCross", paidAmt: 85 },
  { id: 2, patientId: 3, patientName: "Priya Nair", date: "2026-06-12", services: [{ desc: "Chiropractic Adjustment", code: "98940", fee: 85 }, { desc: "Soft Tissue Therapy", code: "97140", fee: 45 }], status: "Pending", insurance: "UnitedHealth", paidAmt: 0 },
  { id: 3, patientId: 2, patientName: "James Whitfield", date: "2026-06-08", services: [{ desc: "Initial Consultation", code: "99203", fee: 150 }], status: "Paid", insurance: "Aetna", paidAmt: 150 },
];
const seedTreatmentPlans = {
  1: { goal: "Resolve lumbar pain, restore full ROM", duration: "8 weeks", frequency: "3x/week", phases: [{ name: "Acute Relief", weeks: "1-2", focus: "Pain reduction via adjustments + ice" }, { name: "Corrective", weeks: "3-6", focus: "Strengthening core + spinal rehab" }, { name: "Maintenance", weeks: "7-8", focus: "2x/week, home exercise independence" }], progress: 60 },
  3: { goal: "Eliminate sciatic symptoms, improve piriformis flexibility", duration: "6 weeks", frequency: "2x/week", phases: [{ name: "Decompression", weeks: "1-2", focus: "Lumbar traction + nerve mobilization" }, { name: "Strengthening", weeks: "3-5", focus: "Hip stabilizers + piriformis stretching" }, { name: "Return to Activity", weeks: "6", focus: "Full activity clearance" }], progress: 80 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const fmtMoney = (n) => "$" + Number(n).toFixed(2);
const statusColor = (s) => s === "Confirmed" || s === "Paid" ? C.sage : s === "Pending" ? C.amber : C.grey;

// ─── Base Components ──────────────────────────────────────────────────────────
const Badge = ({ label, color }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
);
const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 6px rgba(26,39,68,.08)", padding: "20px 24px", ...style }}>{children}</div>
);
const Btn = ({ onClick, children, variant = "primary", small, disabled }) => {
  const base = { border: "none", borderRadius: 8, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", padding: small ? "6px 14px" : "9px 20px", fontSize: small ? 13 : 14, opacity: disabled ? 0.5 : 1, transition: "opacity .15s" };
  const vs = { primary: { background: C.navy, color: "#fff" }, outline: { background: "transparent", color: C.navy, border: `1.5px solid ${C.navy}` }, danger: { background: "#fee2e2", color: "#b91c1c" }, sage: { background: C.sage, color: "#fff" }, amber: { background: C.amber, color: "#fff" }, purple: { background: C.purple, color: "#fff" } };
  return <button style={{ ...base, ...vs[variant] }} onClick={disabled ? undefined : onClick}>{children}</button>;
};
const Inp = ({ label, style: s, ...p }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.grey, textTransform: "uppercase", letterSpacing: .4 }}>{label}</label>}
    <input {...p} style={{ border: `1.5px solid ${C.lightGrey}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", background: "#fafafa", fontFamily: "inherit", ...s }} />
  </div>
);
const TA = ({ label, style: s, ...p }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.grey, textTransform: "uppercase", letterSpacing: .4 }}>{label}</label>}
    <textarea {...p} rows={p.rows || 3} style={{ border: `1.5px solid ${C.lightGrey}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", background: "#fafafa", resize: "vertical", fontFamily: "inherit", ...s }} />
  </div>
);
const Sel = ({ label, children, ...p }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.grey, textTransform: "uppercase", letterSpacing: .4 }}>{label}</label>}
    <select {...p} style={{ border: `1.5px solid ${C.lightGrey}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, background: "#fafafa", ...p.style }}>{children}</select>
  </div>
);
const SectionTitle = ({ children }) => <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 20px" }}>{children}</h2>;

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { key: "dashboard", icon: "⊞", label: "Dashboard" },
  { key: "patients", icon: "👤", label: "Patients" },
  { key: "appointments", icon: "📅", label: "Appointments" },
  { key: "intake", icon: "📝", label: "Intake Forms" },
  { key: "soap", icon: "📋", label: "SOAP Notes" },
  { key: "plans", icon: "🗺", label: "Treatment Plans" },
  { key: "rx", icon: "💪", label: "Home Rx" },
  { key: "billing", icon: "💳", label: "Billing" },
  { key: "analytics", icon: "📊", label: "Analytics" },
  { key: "clinic", icon: "🏥", label: "Clinic" },
];
const Sidebar = ({ active, setActive }) => (
  <div style={{ width: 220, minHeight: "100vh", background: C.navy, display: "flex", flexDirection: "column", padding: "0 0 24px", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
    <div style={{ padding: "24px 20px 18px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
      <div style={{ fontSize: 10, color: C.amber, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>ChiroPMS Pro</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.25, marginTop: 4 }}>Spine &<br />Wellness Clinic</div>
    </div>
    <nav style={{ marginTop: 12, flex: 1 }}>
      {NAV.map(n => (
        <button key={n.key} onClick={() => setActive(n.key)}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 20px", border: "none", background: active === n.key ? "rgba(255,255,255,.12)" : "transparent", color: active === n.key ? "#fff" : "rgba(255,255,255,.55)", fontSize: 13.5, fontWeight: active === n.key ? 700 : 400, cursor: "pointer", borderLeft: active === n.key ? `3px solid ${C.amber}` : "3px solid transparent", textAlign: "left" }}>
          <span style={{ fontSize: 15 }}>{n.icon}</span>{n.label}
        </button>
      ))}
    </nav>
    <div style={{ padding: "0 20px", color: "rgba(255,255,255,.35)", fontSize: 10 }}>v2.0 · Pro Edition</div>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ patients, appointments, invoices }) => {
  const t = todayStr();
  const todayAppts = appointments.filter(a => a.date === t);
  const revenue = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.services.reduce((x, sv) => x + sv.fee, 0), 0);
  const outstanding = invoices.filter(i => i.status === "Pending").reduce((s, i) => s + i.services.reduce((x, sv) => x + sv.fee, 0), 0);
  const stats = [
    { label: "Total Patients", value: patients.length, color: C.blue, icon: "👤" },
    { label: "Today's Visits", value: todayAppts.length, color: C.sage, icon: "📅" },
    { label: "Revenue (Paid)", value: fmtMoney(revenue), color: C.purple, icon: "💰" },
    { label: "Outstanding", value: fmtMoney(outstanding), color: C.amber, icon: "⏳" },
  ];
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: C.navy, margin: "0 0 4px" }}>Good morning 👋</h1>
      <p style={{ color: C.grey, margin: "0 0 24px", fontSize: 14 }}>{fmtDate(t)} — here's your clinic at a glance.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ borderTop: `4px solid ${s.color}`, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, color: C.grey, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <Card>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.navy }}>Upcoming Appointments</h3>
          {appointments.filter(a => a.date >= t).slice(0, 5).map(a => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.lightGrey}` }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.patientName}</div>
                <div style={{ color: C.grey, fontSize: 12 }}>{fmtDate(a.date)} · {a.time} · {a.type}</div>
              </div>
              <Badge label={a.status} color={statusColor(a.status)} />
            </div>
          ))}
          {appointments.filter(a => a.date >= t).length === 0 && <p style={{ color: C.grey, fontSize: 13 }}>No upcoming appointments.</p>}
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.navy }}>Recent Patients</h3>
          {patients.slice(-5).reverse().map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.lightGrey}` }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</div>
                <div style={{ color: C.grey, fontSize: 12 }}>{p.condition}</div>
              </div>
              <Badge label={`${p.visits} visits`} color={C.blue} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ─── Patients ─────────────────────────────────────────────────────────────────
const Patients = ({ patients, setPatients, setView, setSelectedPatientId }) => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", dob: "", phone: "", email: "", condition: "", insurance: "" });
  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase()));
  const add = () => {
    if (!form.name) return;
    setPatients(prev => [...prev, { ...form, id: Date.now(), visits: 0, nextAppt: "", intakeComplete: false }]);
    setForm({ name: "", dob: "", phone: "", email: "", condition: "", insurance: "" });
    setShowForm(false);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle>Patients</SectionTitle>
        <Btn onClick={() => setShowForm(!showForm)}>+ Add Patient</Btn>
      </div>
      {showForm && (
        <Card style={{ marginBottom: 20, borderLeft: `4px solid ${C.blue}` }}>
          <h3 style={{ margin: "0 0 14px", color: C.navy }}>New Patient</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Inp label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" />
            <Inp label="Date of Birth" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
            <Inp label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Inp label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Inp label="Chief Complaint" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} />
            <Inp label="Insurance Provider" value={form.insurance} onChange={e => setForm(f => ({ ...f, insurance: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Btn onClick={add}>Save Patient</Btn>
            <Btn variant="outline" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </Card>
      )}
      <Card style={{ marginBottom: 14 }}>
        <Inp placeholder="Search by name or condition…" value={search} onChange={e => setSearch(e.target.value)} />
      </Card>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["Name", "DOB", "Condition", "Insurance", "Visits", "Intake", ""].map(h => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.grey, textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderTop: `1px solid ${C.lightGrey}`, background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ padding: "12px 14px", fontWeight: 600, color: C.navy, fontSize: 13.5 }}>{p.name}</td>
                <td style={{ padding: "12px 14px", color: C.grey, fontSize: 12 }}>{fmtDate(p.dob)}</td>
                <td style={{ padding: "12px 14px", fontSize: 13 }}>{p.condition}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, color: C.grey }}>{p.insurance || "—"}</td>
                <td style={{ padding: "12px 14px" }}><Badge label={p.visits} color={C.blue} /></td>
                <td style={{ padding: "12px 14px" }}><Badge label={p.intakeComplete ? "✓ Done" : "Pending"} color={p.intakeComplete ? C.sage : C.amber} /></td>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn small variant="outline" onClick={() => { setSelectedPatientId(p.id); setView("soap"); }}>SOAP</Btn>
                    <Btn small variant="outline" onClick={() => { setSelectedPatientId(p.id); setView("plans"); }}>Plan</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ padding: 20, color: C.grey, textAlign: "center" }}>No patients found.</p>}
      </Card>
    </div>
  );
};

// ─── Appointments ─────────────────────────────────────────────────────────────
const Appointments = ({ appointments, setAppointments, patients }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: "", date: "", time: "09:00", type: "Adjustment", notes: "" });
  const [filter, setFilter] = useState("upcoming");
  const filtered = appointments.filter(a => {
    if (filter === "upcoming") return a.date >= todayStr();
    if (filter === "today") return a.date === todayStr();
    return a.date < todayStr();
  }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const add = () => {
    const p = patients.find(x => x.id === Number(form.patientId));
    if (!p || !form.date) return;
    setAppointments(prev => [...prev, { ...form, id: Date.now(), patientName: p.name, patientId: Number(form.patientId), status: "Pending" }]);
    setForm({ patientId: "", date: "", time: "09:00", type: "Adjustment", notes: "" });
    setShowForm(false);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle>Appointments</SectionTitle>
        <Btn onClick={() => setShowForm(!showForm)}>+ Book</Btn>
      </div>
      {showForm && (
        <Card style={{ marginBottom: 20, borderLeft: `4px solid ${C.sage}` }}>
          <h3 style={{ margin: "0 0 14px", color: C.navy }}>New Appointment</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Sel label="Patient" value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}>
              <option value="">Select patient…</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Sel>
            <Sel label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {["Initial Consult", "Adjustment", "Follow-up", "Re-evaluation", "X-Ray Review"].map(t => <option key={t}>{t}</option>)}
            </Sel>
            <Inp label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Inp label="Time" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
          </div>
          <div style={{ marginTop: 12 }}>
            <TA label="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Btn onClick={add}>Book</Btn>
            <Btn variant="outline" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </Card>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["upcoming", "Upcoming"], ["today", "Today"], ["past", "Past"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ padding: "7px 16px", borderRadius: 20, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", background: filter === k ? C.navy : C.lightGrey, color: filter === k ? "#fff" : C.grey }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(a => (
          <Card key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ textAlign: "center", background: C.bg, borderRadius: 10, padding: "8px 14px", minWidth: 58 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.grey, textTransform: "uppercase" }}>{fmtDate(a.date).split(" ")[0]}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{new Date(a.date + "T12:00:00").getDate()}</div>
                <div style={{ fontSize: 11, color: C.blue, fontWeight: 600 }}>{a.time}</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>{a.patientName}</div>
                <div style={{ color: C.grey, fontSize: 13 }}>{a.type}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge label={a.status} color={statusColor(a.status)} />
              {a.status === "Pending" && <Btn small variant="sage" onClick={() => setAppointments(prev => prev.map(x => x.id === a.id ? { ...x, status: "Confirmed" } : x))}>Confirm</Btn>}
              <Btn small variant="danger" onClick={() => setAppointments(prev => prev.filter(x => x.id !== a.id))}>Remove</Btn>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <Card><p style={{ color: C.grey, textAlign: "center", margin: 0 }}>No appointments in this view.</p></Card>}
      </div>
    </div>
  );
};

// ─── Intake Forms ─────────────────────────────────────────────────────────────
const IntakeForms = ({ patients, setPatients }) => {
  const [selectedId, setSelectedId] = useState(patients[0]?.id);
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ painScale: "5", location: "", onset: "", duration: "", aggravating: "", relieving: "", previousTreatment: "", medications: "", surgeries: "", familyHistory: "", lifestyle: "", goals: "" });
  const [submitted, setSubmitted] = useState(false);
  const patient = patients.find(p => p.id === selectedId);
  const steps = ["Pain Profile", "Medical History", "Lifestyle & Goals"];
  const submit = () => {
    setPatients(prev => prev.map(p => p.id === selectedId ? { ...p, intakeComplete: true, intakeData: data } : p));
    setSubmitted(true);
  };
  const reset = () => { setSubmitted(false); setStep(0); setData({ painScale: "5", location: "", onset: "", duration: "", aggravating: "", relieving: "", previousTreatment: "", medications: "", surgeries: "", familyHistory: "", lifestyle: "", goals: "" }); };
  return (
    <div>
      <SectionTitle>Patient Intake Forms</SectionTitle>
      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.grey }}>Patient:</label>
          <select value={selectedId} onChange={e => { setSelectedId(Number(e.target.value)); reset(); }} style={{ border: `1.5px solid ${C.lightGrey}`, borderRadius: 8, padding: "8px 14px", fontSize: 14, background: "#fafafa" }}>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {patient?.intakeComplete && <Badge label="✓ Intake on file" color={C.sage} />}
        </div>
      </Card>
      {submitted ? (
        <Card style={{ borderLeft: `4px solid ${C.sage}`, textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <h3 style={{ color: C.navy, margin: "0 0 8px" }}>Intake Complete!</h3>
          <p style={{ color: C.grey, margin: "0 0 20px" }}>All information has been saved to {patient?.name}'s record.</p>
          <Btn onClick={reset}>Fill New Intake</Btn>
        </Card>
      ) : (
        <Card>
          <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `2px solid ${C.lightGrey}` }}>
            {steps.map((s, i) => (
              <div key={s} onClick={() => setStep(i)} style={{ padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13, color: step === i ? C.navy : C.grey, borderBottom: step === i ? `2px solid ${C.blue}` : "2px solid transparent", marginBottom: -2 }}>{s}</div>
            ))}
          </div>
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.grey, textTransform: "uppercase", letterSpacing: .4 }}>Pain Scale (0–10): <strong style={{ color: C.navy, fontSize: 16 }}>{data.painScale}</strong></label>
                <input type="range" min="0" max="10" value={data.painScale} onChange={e => setData(d => ({ ...d, painScale: e.target.value }))} style={{ width: "100%", marginTop: 8, accentColor: C.blue }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.grey }}><span>No pain</span><span>Worst pain</span></div>
              </div>
              <Inp label="Pain Location (e.g. lower back, left hip)" value={data.location} onChange={e => setData(d => ({ ...d, location: e.target.value }))} />
              <Inp label="Onset — When did symptoms begin?" value={data.onset} onChange={e => setData(d => ({ ...d, onset: e.target.value }))} />
              <Inp label="Duration of symptoms" value={data.duration} onChange={e => setData(d => ({ ...d, duration: e.target.value }))} placeholder="e.g. 3 weeks" />
              <TA label="What makes it worse?" value={data.aggravating} onChange={e => setData(d => ({ ...d, aggravating: e.target.value }))} />
              <TA label="What provides relief?" value={data.relieving} onChange={e => setData(d => ({ ...d, relieving: e.target.value }))} />
            </div>
          )}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <TA label="Previous chiropractic or physical therapy treatment?" value={data.previousTreatment} onChange={e => setData(d => ({ ...d, previousTreatment: e.target.value }))} />
              <TA label="Current medications" value={data.medications} onChange={e => setData(d => ({ ...d, medications: e.target.value }))} placeholder="List any medications or supplements…" />
              <TA label="Prior surgeries or injuries" value={data.surgeries} onChange={e => setData(d => ({ ...d, surgeries: e.target.value }))} />
              <TA label="Family history of spinal conditions?" value={data.familyHistory} onChange={e => setData(d => ({ ...d, familyHistory: e.target.value }))} />
            </div>
          )}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <TA label="Lifestyle — Occupation, activity level, posture habits" value={data.lifestyle} onChange={e => setData(d => ({ ...d, lifestyle: e.target.value }))} rows={4} placeholder="e.g. Desk job 8h/day, occasional walking…" />
              <TA label="Treatment goals — What would you like to achieve?" value={data.goals} onChange={e => setData(d => ({ ...d, goals: e.target.value }))} rows={4} placeholder="e.g. Return to golf, reduce daily pain, sleep better…" />
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <Btn variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Back</Btn>
            {step < steps.length - 1
              ? <Btn onClick={() => setStep(s => s + 1)}>Next →</Btn>
              : <Btn variant="sage" onClick={submit}>Submit Intake ✓</Btn>}
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── AI SOAP Notes ────────────────────────────────────────────────────────────
const SOAPNotes = ({ patients, soapNotes, setSoapNotes, selectedPatientId }) => {
  const [patientId, setPatientId] = useState(selectedPatientId || patients[0]?.id);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: todayStr(), S: "", O: "", A: "", P: "" });
  const [aiContext, setAiContext] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiField, setAiField] = useState(null);
  useEffect(() => { if (selectedPatientId) setPatientId(selectedPatientId); }, [selectedPatientId]);
  const notes = soapNotes[patientId] || [];
  const patient = patients.find(p => p.id === patientId);
  const save = () => {
    if (!form.S) return;
    setSoapNotes(prev => ({ ...prev, [patientId]: [form, ...(prev[patientId] || [])] }));
    setForm({ date: todayStr(), S: "", O: "", A: "", P: "" });
    setShowForm(false);
  };
  const generateWithAI = async (field) => {
    setAiField(field);
    setAiLoading(true);
    const fieldNames = { S: "Subjective", O: "Objective", A: "Assessment", P: "Plan" };
    const prompt = `You are a chiropractic clinical documentation assistant. Generate a professional, concise ${fieldNames[field]} section for a SOAP note.

Patient: ${patient?.name}, chief complaint: ${patient?.condition}.
Clinical context provided by clinician: ${aiContext || "Standard chiropractic visit"}
Current form data: S="${form.S}" O="${form.O}" A="${form.A}" P="${form.P}"

Write ONLY the ${fieldNames[field]} section content (2-4 sentences). Be clinically accurate, use chiropractic terminology. Do not include labels or prefixes.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      });
      const d = await res.json();
      const text = d.content?.map(c => c.text || "").join("") || "";
      setForm(f => ({ ...f, [field]: text.trim() }));
    } catch (e) { console.error(e); }
    setAiLoading(false);
    setAiField(null);
  };
  const generateAll = async () => {
    setAiLoading(true);
    const prompt = `You are a chiropractic clinical documentation assistant. Generate a complete professional SOAP note.

Patient: ${patient?.name}, chief complaint: ${patient?.condition}.
Clinical context: ${aiContext || "Standard chiropractic adjustment visit"}

Return ONLY valid JSON (no markdown) in this exact format:
{"S":"...","O":"...","A":"...","P":"..."}

Each field 2-4 sentences, clinically accurate with chiropractic terminology.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      });
      const d = await res.json();
      const text = d.content?.map(c => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setForm(f => ({ ...f, ...parsed }));
    } catch (e) { console.error(e); }
    setAiLoading(false);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle>SOAP Notes</SectionTitle>
        <Btn onClick={() => setShowForm(!showForm)}>+ New Note</Btn>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <Sel label="" value={patientId} onChange={e => setPatientId(Number(e.target.value))}>
          {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Sel>
      </Card>
      {showForm && (
        <Card style={{ marginBottom: 20, borderLeft: `4px solid ${C.amber}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: C.navy }}>New SOAP Note</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: C.purple, fontWeight: 700 }}>✨ AI Assist</span>
            </div>
          </div>
          <div style={{ background: `${C.purple}11`, border: `1px solid ${C.purple}33`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.purple, textTransform: "uppercase", letterSpacing: .4 }}>✨ AI Context — Describe this visit briefly</label>
            <TA style={{ marginTop: 8, background: "#fff" }} rows={2} value={aiContext} onChange={e => setAiContext(e.target.value)} placeholder="e.g. Patient returned with 40% improvement, mild tenderness at L4, performed HVLA adjustment…" />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Btn variant="purple" small onClick={generateAll} disabled={aiLoading}>{aiLoading && !aiField ? "Generating…" : "✨ Generate Full Note"}</Btn>
              <span style={{ fontSize: 12, color: C.grey, alignSelf: "center" }}>or fill individual fields below then use per-field AI</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Inp label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            {[["S", "Subjective — Patient's reported symptoms", C.blue], ["O", "Objective — Clinical findings", C.sage], ["A", "Assessment — Diagnosis/impression", C.amber], ["P", "Plan — Treatment & next steps", C.navy]].map(([k, lbl, col]) => (
              <div key={k}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.grey, textTransform: "uppercase", letterSpacing: .4 }}><span style={{ color: col, fontWeight: 800, fontSize: 14 }}>{k}</span> — {lbl.split("—")[1]}</label>
                  <button onClick={() => generateWithAI(k)} disabled={aiLoading} style={{ fontSize: 11, color: C.purple, background: `${C.purple}15`, border: `1px solid ${C.purple}40`, borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontWeight: 600 }}>
                    {aiLoading && aiField === k ? "…" : "✨ AI"}
                  </button>
                </div>
                <TA rows={3} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={`${lbl}…`} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Btn onClick={save}>Save Note</Btn>
            <Btn variant="outline" onClick={() => { setShowForm(false); setAiContext(""); }}>Cancel</Btn>
          </div>
        </Card>
      )}
      {notes.length === 0 && <Card><p style={{ color: C.grey, textAlign: "center", margin: 0 }}>No SOAP notes yet for this patient.</p></Card>}
      {notes.map((n, i) => (
        <Card key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>Visit Note</span>
            <span style={{ fontSize: 12, color: C.grey }}>{fmtDate(n.date)}</span>
          </div>
          {[["S", "Subjective", C.blue], ["O", "Objective", C.sage], ["A", "Assessment", C.amber], ["P", "Plan", C.navy]].map(([k, label, color]) => (
            <div key={k} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <span style={{ fontWeight: 800, color, fontSize: 15, minWidth: 18 }}>{k}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.grey, textTransform: "uppercase", letterSpacing: .4 }}>{label}</div>
                <div style={{ fontSize: 13.5, color: "#374151", marginTop: 2 }}>{n[k] || "—"}</div>
              </div>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
};

// ─── Treatment Plans ──────────────────────────────────────────────────────────
const TreatmentPlans = ({ patients, treatmentPlans, setTreatmentPlans, selectedPatientId }) => {
  const [patientId, setPatientId] = useState(selectedPatientId || patients[0]?.id);
  const [editing, setEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ goal: "", duration: "8 weeks", frequency: "3x/week", phases: [{ name: "", weeks: "", focus: "" }], progress: 0 });
  useEffect(() => { if (selectedPatientId) setPatientId(selectedPatientId); }, [selectedPatientId]);
  const plan = treatmentPlans[patientId];
  const patient = patients.find(p => p.id === patientId);
  const startEdit = () => {
    setForm(plan || { goal: "", duration: "8 weeks", frequency: "3x/week", phases: [{ name: "", weeks: "", focus: "" }], progress: 0 });
    setEditing(true);
  };
  const save = () => { setTreatmentPlans(prev => ({ ...prev, [patientId]: form })); setEditing(false); };
  const addPhase = () => setForm(f => ({ ...f, phases: [...f.phases, { name: "", weeks: "", focus: "" }] }));
  const generateWithAI = async () => {
    setAiLoading(true);
    const prompt = `You are a chiropractic treatment planning expert. Create a detailed treatment plan for:
Patient: ${patient?.name}, chief complaint: ${patient?.condition}.

Return ONLY valid JSON (no markdown):
{"goal":"...","duration":"X weeks","frequency":"Xx/week","phases":[{"name":"Phase name","weeks":"1-2","focus":"Treatment focus description"},...]}

Include 3 phases. Be specific to chiropractic care.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      });
      const d = await res.json();
      const text = d.content?.map(c => c.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setForm(f => ({ ...f, ...parsed }));
    } catch (e) { console.error(e); }
    setAiLoading(false);
  };
  const phaseColors = [C.blue, C.sage, C.amber];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle>Treatment Plans</SectionTitle>
        <Btn onClick={startEdit}>{plan ? "Edit Plan" : "+ Create Plan"}</Btn>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <Sel value={patientId} onChange={e => { setPatientId(Number(e.target.value)); setEditing(false); }}>
          {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Sel>
      </Card>
      {editing && (
        <Card style={{ marginBottom: 20, borderLeft: `4px solid ${C.purple}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: C.navy }}>Treatment Plan</h3>
            <Btn variant="purple" small onClick={generateWithAI} disabled={aiLoading}>{aiLoading ? "Generating…" : "✨ AI Generate"}</Btn>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TA label="Treatment Goal" value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} rows={2} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Inp label="Total Duration" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="8 weeks" />
              <Inp label="Visit Frequency" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} placeholder="3x/week" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.grey, textTransform: "uppercase", letterSpacing: .4 }}>Progress: {form.progress}%</label>
              <input type="range" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))} style={{ width: "100%", marginTop: 8, accentColor: C.sage }} />
            </div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.grey, textTransform: "uppercase", letterSpacing: .4 }}>Phases</label>
            {form.phases.map((ph, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: 10, padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 10 }}>
                <Inp label="Phase Name" value={ph.name} onChange={e => setForm(f => { const ps = [...f.phases]; ps[i] = { ...ps[i], name: e.target.value }; return { ...f, phases: ps }; })} placeholder="Acute Relief" />
                <Inp label="Weeks" value={ph.weeks} onChange={e => setForm(f => { const ps = [...f.phases]; ps[i] = { ...ps[i], weeks: e.target.value }; return { ...f, phases: ps }; })} placeholder="1-2" />
                <Inp label="Focus" value={ph.focus} onChange={e => setForm(f => { const ps = [...f.phases]; ps[i] = { ...ps[i], focus: e.target.value }; return { ...f, phases: ps }; })} placeholder="Treatment focus…" />
              </div>
            ))}
            <Btn variant="outline" small onClick={addPhase}>+ Add Phase</Btn>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Btn onClick={save}>Save Plan</Btn>
            <Btn variant="outline" onClick={() => setEditing(false)}>Cancel</Btn>
          </div>
        </Card>
      )}
      {!editing && plan && (
        <div>
          <Card style={{ marginBottom: 16, borderTop: `4px solid ${C.purple}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.grey, textTransform: "uppercase", letterSpacing: .4, marginBottom: 4 }}>Goal</div>
                <div style={{ fontSize: 15, color: C.navy, fontWeight: 600 }}>{plan.goal}</div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: C.grey, fontWeight: 700, textTransform: "uppercase" }}>Duration</div>
                  <div style={{ fontWeight: 800, color: C.blue }}>{plan.duration}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: C.grey, fontWeight: 700, textTransform: "uppercase" }}>Frequency</div>
                  <div style={{ fontWeight: 800, color: C.blue }}>{plan.frequency}</div>
                </div>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.grey, marginBottom: 6 }}>
                <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: .4 }}>Progress</span>
                <span style={{ fontWeight: 700, color: C.sage }}>{plan.progress}%</span>
              </div>
              <div style={{ background: C.lightGrey, borderRadius: 20, height: 10, overflow: "hidden" }}>
                <div style={{ background: `linear-gradient(90deg, ${C.sage}, ${C.blue})`, width: `${plan.progress}%`, height: "100%", borderRadius: 20, transition: "width .4s" }} />
              </div>
            </div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${plan.phases.length}, 1fr)`, gap: 14 }}>
            {plan.phases.map((ph, i) => (
              <Card key={i} style={{ borderTop: `4px solid ${phaseColors[i % 3]}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: phaseColors[i % 3], textTransform: "uppercase", letterSpacing: .4, marginBottom: 4 }}>Phase {i + 1} · Wk {ph.weeks}</div>
                <div style={{ fontWeight: 700, color: C.navy, marginBottom: 8, fontSize: 14 }}>{ph.name}</div>
                <div style={{ fontSize: 13, color: C.grey }}>{ph.focus}</div>
              </Card>
            ))}
          </div>
        </div>
      )}
      {!editing && !plan && <Card><p style={{ color: C.grey, textAlign: "center", margin: 0 }}>No treatment plan yet. Create one above or use AI to generate.</p></Card>}
    </div>
  );
};

// ─── Home Rx ──────────────────────────────────────────────────────────────────
const HomeRx = ({ patients, rxNotes, setRxNotes }) => {
  const [patientId, setPatientId] = useState(patients[0]?.id);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: todayStr(), exercises: "", frequency: "Once daily", notes: "" });
  const [aiLoading, setAiLoading] = useState(false);
  const patient = patients.find(p => p.id === patientId);
  const rxs = rxNotes[patientId] || [];
  const save = () => {
    if (!form.exercises) return;
    setRxNotes(prev => ({ ...prev, [patientId]: [form, ...(prev[patientId] || [])] }));
    setForm({ date: todayStr(), exercises: "", frequency: "Once daily", notes: "" });
    setShowForm(false);
  };
  const generateRx = async () => {
    setAiLoading(true);
    const prompt = `You are a chiropractic rehabilitation specialist. Create a home exercise program for:
Patient chief complaint: ${patient?.condition}.
Return ONLY valid JSON: {"exercises":"List of 4-5 exercises with sets/reps/duration each on a new line","frequency":"Once daily|Twice daily|Every other day","notes":"Precautions and tips"}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      });
      const d = await res.json();
      const text = d.content?.map(c => c.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setForm(f => ({ ...f, ...parsed }));
    } catch (e) { console.error(e); }
    setAiLoading(false);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle>Home Recommendations</SectionTitle>
        <Btn onClick={() => setShowForm(!showForm)}>+ New Rx</Btn>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <Sel value={patientId} onChange={e => setPatientId(Number(e.target.value))}>
          {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Sel>
      </Card>
      {showForm && (
        <Card style={{ marginBottom: 20, borderLeft: `4px solid ${C.sage}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: C.navy }}>Home Exercise Prescription</h3>
            <Btn variant="purple" small onClick={generateRx} disabled={aiLoading}>{aiLoading ? "Generating…" : "✨ AI Generate"}</Btn>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Inp label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <TA label="Exercises / Stretches" value={form.exercises} onChange={e => setForm(f => ({ ...f, exercises: e.target.value }))} rows={5} placeholder="Cat-cow x10 reps…" />
            <Sel label="Frequency" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
              {["Once daily", "Twice daily", "Three times daily", "Every other day", "As needed"].map(t => <option key={t}>{t}</option>)}
            </Sel>
            <TA label="Notes / Precautions" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Btn onClick={save}>Save Rx</Btn>
            <Btn variant="outline" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </Card>
      )}
      {rxs.length === 0 && <Card><p style={{ color: C.grey, textAlign: "center", margin: 0 }}>No home Rx yet. Create one or use AI.</p></Card>}
      {rxs.map((r, i) => (
        <Card key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>🏋️ Home Exercise Program</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge label={r.frequency} color={C.sage} />
              <span style={{ fontSize: 12, color: C.grey }}>{fmtDate(r.date)}</span>
            </div>
          </div>
          <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: r.notes ? 10 : 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.grey, textTransform: "uppercase", letterSpacing: .4, marginBottom: 6 }}>Exercises</div>
            <div style={{ fontSize: 13.5, color: "#374151", whiteSpace: "pre-line" }}>{r.exercises}</div>
          </div>
          {r.notes && <div style={{ borderLeft: `3px solid ${C.amber}`, paddingLeft: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: .4, marginBottom: 4 }}>Precautions</div>
            <div style={{ fontSize: 13, color: "#374151" }}>{r.notes}</div>
          </div>}
        </Card>
      ))}
    </div>
  );
};

// ─── Billing ──────────────────────────────────────────────────────────────────
const SERVICE_CODES = [
  { desc: "Initial Consultation", code: "99203", fee: 150 },
  { desc: "Chiropractic Adjustment (1-2 regions)", code: "98940", fee: 75 },
  { desc: "Chiropractic Adjustment (3-4 regions)", code: "98941", fee: 95 },
  { desc: "Chiropractic Adjustment (5+ regions)", code: "98942", fee: 115 },
  { desc: "Soft Tissue Therapy", code: "97140", fee: 45 },
  { desc: "Therapeutic Exercise", code: "97110", fee: 50 },
  { desc: "Re-evaluation", code: "99213", fee: 85 },
  { desc: "X-Ray (Lumbar)", code: "72100", fee: 120 },
];
const Billing = ({ patients, invoices, setInvoices }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: "", date: todayStr(), services: [], insurance: "" });
  const [filterStatus, setFilterStatus] = useState("all");
  const addService = (svc) => setForm(f => ({ ...f, services: [...f.services, { ...svc }] }));
  const removeService = (i) => setForm(f => ({ ...f, services: f.services.filter((_, idx) => idx !== i) }));
  const createInvoice = () => {
    const p = patients.find(x => x.id === Number(form.patientId));
    if (!p || !form.services.length) return;
    setInvoices(prev => [...prev, { ...form, id: Date.now(), patientName: p.name, patientId: Number(form.patientId), status: "Pending", paidAmt: 0 }]);
    setForm({ patientId: "", date: todayStr(), services: [], insurance: "" });
    setShowForm(false);
  };
  const markPaid = (id) => setInvoices(prev => prev.map(i => {
    if (i.id !== id) return i;
    const total = i.services.reduce((s, sv) => s + sv.fee, 0);
    return { ...i, status: "Paid", paidAmt: total };
  }));
  const filtered = invoices.filter(i => filterStatus === "all" || i.status === filterStatus);
  const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.services.reduce((x, sv) => x + sv.fee, 0), 0);
  const outstanding = invoices.filter(i => i.status === "Pending").reduce((s, i) => s + i.services.reduce((x, sv) => x + sv.fee, 0), 0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle>Billing & Invoicing</SectionTitle>
        <Btn onClick={() => setShowForm(!showForm)}>+ New Invoice</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        {[["Total Invoices", invoices.length, C.blue], ["Revenue Collected", fmtMoney(totalRevenue), C.sage], ["Outstanding", fmtMoney(outstanding), C.amber]].map(([l, v, col]) => (
          <Card key={l} style={{ borderTop: `4px solid ${col}`, padding: "14px 18px" }}>
            <div style={{ fontSize: 11, color: C.grey, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: col, marginTop: 4 }}>{v}</div>
          </Card>
        ))}
      </div>
      {showForm && (
        <Card style={{ marginBottom: 20, borderLeft: `4px solid ${C.blue}` }}>
          <h3 style={{ margin: "0 0 14px", color: C.navy }}>New Invoice</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            <Sel label="Patient" value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value, insurance: patients.find(p => p.id === Number(e.target.value))?.insurance || "" }))}>
              <option value="">Select…</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Sel>
            <Inp label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Inp label="Insurance" value={form.insurance} onChange={e => setForm(f => ({ ...f, insurance: e.target.value }))} />
          </div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.grey, textTransform: "uppercase", letterSpacing: .4 }}>Add Services</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, margin: "10px 0" }}>
            {SERVICE_CODES.map(s => (
              <button key={s.code} onClick={() => addService(s)} style={{ background: C.bg, border: `1px solid ${C.lightGrey}`, borderRadius: 8, padding: "8px 12px", cursor: "pointer", textAlign: "left", fontSize: 12 }}>
                <span style={{ fontWeight: 700, color: C.navy }}>{s.code}</span> <span style={{ color: C.grey }}>{s.desc}</span> <span style={{ float: "right", color: C.sage, fontWeight: 700 }}>{fmtMoney(s.fee)}</span>
              </button>
            ))}
          </div>
          {form.services.length > 0 && (
            <div style={{ background: C.bg, borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.grey, textTransform: "uppercase", marginBottom: 8 }}>Selected Services</div>
              {form.services.map((sv, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.lightGrey}` }}>
                  <span style={{ fontSize: 13 }}>{sv.desc} ({sv.code})</span>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: C.sage }}>{fmtMoney(sv.fee)}</span>
                    <button onClick={() => removeService(i)} style={{ border: "none", background: "none", color: C.red, cursor: "pointer", fontSize: 14 }}>×</button>
                  </div>
                </div>
              ))}
              <div style={{ textAlign: "right", fontWeight: 800, color: C.navy, marginTop: 8, fontSize: 16 }}>
                Total: {fmtMoney(form.services.reduce((s, sv) => s + sv.fee, 0))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={createInvoice} disabled={!form.patientId || !form.services.length}>Create Invoice</Btn>
            <Btn variant="outline" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </Card>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["all", "All"], ["Pending", "Pending"], ["Paid", "Paid"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilterStatus(k)} style={{ padding: "7px 16px", borderRadius: 20, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", background: filterStatus === k ? C.navy : C.lightGrey, color: filterStatus === k ? "#fff" : C.grey }}>{l}</button>
        ))}
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["Patient", "Date", "Insurance", "Services", "Total", "Status", ""].map(h => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.grey, textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv, i) => {
              const total = inv.services.reduce((s, sv) => s + sv.fee, 0);
              return (
                <tr key={inv.id} style={{ borderTop: `1px solid ${C.lightGrey}`, background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: C.navy, fontSize: 13 }}>{inv.patientName}</td>
                  <td style={{ padding: "12px 14px", color: C.grey, fontSize: 12 }}>{fmtDate(inv.date)}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: C.grey }}>{inv.insurance || "—"}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: C.grey }}>{inv.services.map(s => s.code).join(", ")}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: C.navy }}>{fmtMoney(total)}</td>
                  <td style={{ padding: "12px 14px" }}><Badge label={inv.status} color={statusColor(inv.status)} /></td>
                  <td style={{ padding: "12px 14px" }}>
                    {inv.status === "Pending" && <Btn small variant="sage" onClick={() => markPaid(inv.id)}>Mark Paid</Btn>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ padding: 20, color: C.grey, textAlign: "center" }}>No invoices in this view.</p>}
      </Card>
    </div>
  );
};

// ─── Analytics ────────────────────────────────────────────────────────────────
const Analytics = ({ patients, appointments, invoices }) => {
  const visitsByMonth = [
    { month: "Jan", visits: 18 }, { month: "Feb", visits: 22 }, { month: "Mar", visits: 28 },
    { month: "Apr", visits: 25 }, { month: "May", visits: 31 }, { month: "Jun", visits: 27 },
  ];
  const revenueByMonth = [
    { month: "Jan", revenue: 1620 }, { month: "Feb", revenue: 1980 }, { month: "Mar", revenue: 2520 },
    { month: "Apr", revenue: 2250 }, { month: "May", revenue: 2790 }, { month: "Jun", revenue: 2430 },
  ];
  const conditionData = [
    { name: "Low Back Pain", value: 38 }, { name: "Neck Pain", value: 24 },
    { name: "Sciatica", value: 18 }, { name: "Headache", value: 12 }, { name: "Other", value: 8 },
  ];
  const PIE_COLORS = [C.blue, C.sage, C.amber, C.purple, C.grey];
  const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.services.reduce((x, sv) => x + sv.fee, 0), 0);
  const avgVisits = patients.length ? (patients.reduce((s, p) => s + p.visits, 0) / patients.length).toFixed(1) : 0;
  return (
    <div>
      <SectionTitle>Analytics</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[["Total Patients", patients.length, C.blue], ["Avg Visits/Patient", avgVisits, C.purple], ["Total Appointments", appointments.length, C.sage], ["Revenue Collected", fmtMoney(totalRevenue), C.amber]].map(([l, v, col]) => (
          <Card key={l} style={{ borderTop: `4px solid ${col}`, padding: "14px 18px" }}>
            <div style={{ fontSize: 11, color: C.grey, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: col, marginTop: 4 }}>{v}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.navy }}>Monthly Visits</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={visitsByMonth}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="visits" fill={C.blue} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.navy }}>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={revenueByMonth}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => fmtMoney(v)} />
              <Line type="monotone" dataKey="revenue" stroke={C.sage} strokeWidth={2.5} dot={{ fill: C.sage, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 18 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.navy }}>Conditions Treated</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={conditionData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {conditionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.navy }}>Top Patients by Visits</h3>
          {[...patients].sort((a, b) => b.visits - a.visits).slice(0, 5).map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${C.lightGrey}` }}>
              <span style={{ fontWeight: 800, color: C.grey, fontSize: 13, minWidth: 20 }}>#{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: C.navy }}>{p.name}</div>
                <div style={{ background: C.lightGrey, borderRadius: 20, height: 6, marginTop: 4, overflow: "hidden" }}>
                  <div style={{ background: PIE_COLORS[i], width: `${Math.min(100, (p.visits / 15) * 100)}%`, height: "100%", borderRadius: 20 }} />
                </div>
              </div>
              <Badge label={`${p.visits} visits`} color={PIE_COLORS[i]} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ─── Clinic Settings ──────────────────────────────────────────────────────────
const Clinic = ({ clinic, setClinic }) => {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div>
      <SectionTitle>Clinic Settings</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", color: C.navy, fontSize: 15 }}>Clinic Information</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Inp label="Clinic Name" value={clinic.name} onChange={e => setClinic(c => ({ ...c, name: e.target.value }))} />
            <Inp label="Practitioner" value={clinic.doctor} onChange={e => setClinic(c => ({ ...c, doctor: e.target.value }))} />
            <Inp label="Phone" value={clinic.phone} onChange={e => setClinic(c => ({ ...c, phone: e.target.value }))} />
            <Inp label="Email" value={clinic.email} onChange={e => setClinic(c => ({ ...c, email: e.target.value }))} />
            <Inp label="Address" value={clinic.address} onChange={e => setClinic(c => ({ ...c, address: e.target.value }))} />
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <Btn onClick={save}>Save Changes</Btn>
            {saved && <span style={{ color: C.sage, fontSize: 13, fontWeight: 700 }}>✓ Saved!</span>}
          </div>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", color: C.navy, fontSize: 15 }}>Hours of Operation</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Inp label="Open" type="time" value={clinic.openTime} onChange={e => setClinic(c => ({ ...c, openTime: e.target.value }))} />
            <Inp label="Close" type="time" value={clinic.closeTime} onChange={e => setClinic(c => ({ ...c, closeTime: e.target.value }))} />
          </div>
          {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(day => (
            <div key={day} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.lightGrey}` }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: C.navy }}>{day}</span>
              <span style={{ color: C.grey, fontSize: 13 }}>{clinic.openTime} – {clinic.closeTime}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0" }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: C.navy }}>Sunday</span>
            <span style={{ color: "#EF4444", fontSize: 13 }}>Closed</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("dashboard");
  const [patients, setPatients] = useState(seedPatients);
  const [appointments, setAppointments] = useState(seedAppts);
  const [soapNotes, setSoapNotes] = useState(seedSOAP);
  const [rxNotes, setRxNotes] = useState(seedRx);
  const [invoices, setInvoices] = useState(seedInvoices);
  const [treatmentPlans, setTreatmentPlans] = useState(seedTreatmentPlans);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [clinic, setClinic] = useState({ name: "Spine & Wellness Clinic", doctor: "Dr. Alex Morgan, DC", phone: "555-1234", email: "hello@spinewellness.com", address: "123 Main St, Suite 4", openTime: "08:00", closeTime: "18:00" });
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", background: C.bg }}>
      <Sidebar active={view} setActive={setView} />
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {view === "dashboard" && <Dashboard patients={patients} appointments={appointments} invoices={invoices} />}
        {view === "patients" && <Patients patients={patients} setPatients={setPatients} setView={setView} setSelectedPatientId={setSelectedPatientId} />}
        {view === "appointments" && <Appointments appointments={appointments} setAppointments={setAppointments} patients={patients} />}
        {view === "intake" && <IntakeForms patients={patients} setPatients={setPatients} />}
        {view === "soap" && <SOAPNotes patients={patients} soapNotes={soapNotes} setSoapNotes={setSoapNotes} selectedPatientId={selectedPatientId} />}
        {view === "plans" && <TreatmentPlans patients={patients} treatmentPlans={treatmentPlans} setTreatmentPlans={setTreatmentPlans} selectedPatientId={selectedPatientId} />}
        {view === "rx" && <HomeRx patients={patients} rxNotes={rxNotes} setRxNotes={setRxNotes} />}
        {view === "billing" && <Billing patients={patients} invoices={invoices} setInvoices={setInvoices} />}
        {view === "analytics" && <Analytics patients={patients} appointments={appointments} invoices={invoices} />}
        {view === "clinic" && <Clinic clinic={clinic} setClinic={setClinic} />}
      </main>
    </div>
  );
}
