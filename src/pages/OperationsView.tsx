import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import MapView from "./MapView";
import { calculatePriorityWithReasons } from "../utils/priority";
import type { Incident } from "../types/Incident";

function OperationsView() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);

  useEffect(() => {
    return onSnapshot(collection(db, "incidents"), (snap) => {
      setIncidents(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Incident, "id">),
        }))
      );
    });
  }, []);

  const enriched = incidents.map((i) => {
    const result = calculatePriorityWithReasons(
      i.severity,
      i.status,
      i.createdAt,
      i.sensorVerified
    );
    return { ...i, priority: result.score };
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
        <h1 className="text-3xl font-semibold mb-1">
          Operations Command Center
        </h1>
        <p className="text-slate-400 text-sm">
          Real-time incident prioritization and situational awareness
        </p>

        {/* KPI STRIP */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <KPI label="Active Incidents" value={stats.total} />
          <KPI label="Critical" value={stats.critical} color="text-red-400" />
          <KPI label="Sensor Verified" value={stats.verified} color="text-indigo-400" />
        </div>
      </header>

      {/* ================= SPLIT VIEW ================= */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 h-[75vh]">

        {/* LEFT — INCIDENT LIST */}
        <aside className="col-span-4 bg-white/5 border border-white/10 rounded-2xl overflow-y-auto">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold">Incident Queue</h2>
            <p className="text-xs text-slate-400">
              Ranked by operational priority
            </p>
          </div>

          {sorted.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-sm">
              No active incidents
            </div>
          )}

          <div className="divide-y divide-white/5">
            {sorted.map((i) => (
              <button
                key={i.id}
                onClick={() => setSelected(i)}
                className={`w-full text-left p-4 transition ${
                  selected?.id === i.id
                    ? "bg-teal-500/20"
                    : "hover:bg-white/5"
                }`}
              >
                {/* PRIORITY BAR */}
                <div className="h-1 rounded-full mb-2 bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-teal-400"
                    style={{ width: `${Math.min(i.priority * 10, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{i.type}</span>
                  <SeverityBadge severity={i.severity} />
                </div>

                <div className="flex justify-between text-xs text-slate-400">
                  <span>Status: {i.status}</span>
                  <span className="text-teal-300">
                    Priority {i.priority}
                  </span>
                </div>

                {i.sensorVerified && (
                  <p className="text-[11px] mt-1 text-indigo-300">
                    ✔ Sensor verified
                  </p>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* RIGHT — MAP */}
        <section className="col-span-8 bg-white rounded-2xl overflow-hidden border border-white/10">
          <MapView focusIncident={selected} />
        </section>
      </div>

      {/* FOOTNOTE */}
      <p className="max-w-7xl mx-auto mt-4 text-xs text-slate-500">
        * Priority and sensor verification are simulated for demonstration.
      </p>
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
    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
      <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Incident["severity"] }) {
  const styles =
    severity === "Critical"
      ? "bg-red-500/20 text-red-300"
      : severity === "Medium"
      ? "bg-orange-500/20 text-orange-300"
      : "bg-green-500/20 text-green-300";

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${styles}`}>
      {severity}
    </span>
  );
}
