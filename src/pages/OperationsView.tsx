import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import MapView from "./MapView";
import { calculatePriorityWithReasons } from "../utils/priority";
import type { Incident } from "../types/Incident";

/* =====================
   HELPERS
===================== */
// Converts Firestore Timestamps safely to JS Dates for the Priority Utility
function safeDate(createdAt: any): Date {
  try {
    if (!createdAt) return new Date();
    if (typeof createdAt.toDate === "function") return createdAt.toDate();
    if (createdAt.seconds) return new Date(createdAt.seconds * 1000);
    const d = new Date(createdAt);
    return isNaN(d.getTime()) ? new Date() : d;
  } catch {
    return new Date();
  }
}

function OperationsView() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);

  useEffect(() => {
    console.log("Subscribing to incidents collection...");
    const unsubscribe = onSnapshot(
      collection(db, "incidents"),
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Incident, "id">),
        }));
        console.log("Raw Data Received:", data);
        setIncidents(data);
      },
      (error) => console.error("Firestore Subscription Error:", error)
    );
    return () => unsubscribe();
  }, []);

  /* =====================
      DATA ENRICHMENT
  ===================== */
  const enriched = incidents.map((i) => {
    let score = 0;
    try {
      // We pass a real Date object here to fix the TS error
      const result = calculatePriorityWithReasons(
        i.severity || "Low",
        i.status || "Reported",
        safeDate(i.createdAt),
        i.sensorVerified || false
      );
      score = result.score;
    } catch (e) {
      console.warn(`Priority calculation failed for ${i.id}:`, e);
      score = 0;
    }
    return { ...i, priority: score };
  });

  const sorted = [...enriched].sort((a, b) => b.priority - a.priority);

  const stats = {
    total: sorted.length,
    critical: sorted.filter((i) => i.severity === "Critical").length,
    verified: sorted.filter((i) => i.sensorVerified).length,
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 px-6 py-6">
      {/* ================= COMMAND HEADER ================= */}
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-semibold mb-1">Operations Command Center</h1>
        <p className="text-slate-400 text-sm">
          Real-time incident prioritization and situational awareness
        </p>

        {/* KPI STRIP */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <KPI label="Active Incidents" value={stats.total} />
          <KPI label="Critical" value={stats.critical} color="text-red-400" />
          <KPI
            label="Sensor Verified"
            value={stats.verified}
            color="text-indigo-400"
          />
        </div>
      </header>

      {/* ================= SPLIT VIEW ================= */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 h-[75vh]">
        {/* LEFT — INCIDENT LIST */}
        <aside className="col-span-12 lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/[0.02]">
            <h2 className="text-lg font-semibold">Incident Queue</h2>
            <p className="text-xs text-slate-400">Ranked by operational priority</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {sorted.length === 0 && (
              <div className="p-12 text-center text-slate-500 text-sm">
                No active incidents found in the system.
              </div>
            )}

            {sorted.map((i) => (
              <button
                key={i.id}
                onClick={() => setSelected(i)}
                className={`w-full text-left p-4 transition-all duration-200 border-l-4 ${
                  selected?.id === i.id
                    ? "bg-teal-500/10 border-teal-500"
                    : "hover:bg-white/5 border-transparent"
                }`}
              >
                {/* PRIORITY BAR */}
                <div className="h-1 rounded-full mb-3 bg-white/10 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      i.priority > 7 ? "bg-red-400" : "bg-teal-400"
                    }`}
                    style={{ width: `${Math.min((i.priority / 10) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold block text-slate-200">
                      {i.type || "Unknown Incident"}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">
                      ID: {i.id.slice(0, 8)}
                    </span>
                  </div>
                  <SeverityBadge severity={i.severity} />
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                    {i.status}
                  </span>
                  <span className="font-mono text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded">
                    PRIORITY {i.priority}
                  </span>
                </div>

                {i.sensorVerified && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                    <p className="text-[11px] font-medium text-indigo-300">
                      Sensor Link Verified
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* RIGHT — MAP */}
        <section className="col-span-12 lg:col-span-8 bg-slate-900 rounded-2xl overflow-hidden border border-white/10 relative">
          <MapView focusIncident={selected} />
          
          {/* Overlay UI for Map */}
          {!selected && sorted.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 pointer-events-none">
              Select an incident from the queue to locate on map
            </div>
          )}
        </section>
      </div>

      {/* FOOTNOTE */}
      <footer className="max-w-7xl mx-auto mt-4 flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-widest">
        <span>© Command v2.0.4</span>
        <span>* Priority ranking logic is currently live</span>
      </footer>
    </main>
  );
}

export default OperationsView;

/* ================= SUB COMPONENTS ================= */

function KPI({
  label,
  value,
  color = "text-slate-100",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 shadow-inner">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1 font-bold">
        {label}
      </p>
      <p className={`text-3xl font-mono font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Incident["severity"] }) {
  const styles =
    severity === "Critical"
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : severity === "Medium"
      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${styles}`}>
      {severity?.toUpperCase() || "LOW"}
    </span>
  );
}