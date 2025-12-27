import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import MapView from "./MapView";
import { calculatePriorityWithReasons } from "../utils/priority";
import type { Incident } from "../types/Incident";

/* =====================
   COMPONENT
===================== */
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
      i.status,          // ✅ now correctly typed as Status
      i.createdAt,
      i.sensorVerified
    );
    return { ...i, priority: result.score };
  });

  const sorted = [...enriched].sort((a, b) => b.priority - a.priority);

  const counts = {
    Critical: sorted.filter((i) => i.severity === "Critical").length,
    Medium: sorted.filter((i) => i.severity === "Medium").length,
    Low: sorted.filter((i) => i.severity === "Low").length,
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-6">
      {/* ================= HEADER ================= */}
      <header className="mb-6">
        <h1 className="text-3xl font-semibold mb-1">
          🔴 Operations View
        </h1>
        <p className="text-slate-400 text-sm">
          “Clarity saves time. Time saves lives.”
        </p>

        <div className="mt-4 flex gap-6 text-sm">
          <span className="text-red-400">🔴 {counts.Critical} Critical</span>
          <span className="text-orange-400">🟠 {counts.Medium} Medium</span>
          <span className="text-green-400">🟢 {counts.Low} Low</span>
        </div>
      </header>

      {/* ================= SPLIT VIEW ================= */}
      <div className="grid grid-cols-12 gap-6 h-[78vh]">

        {/* LEFT — INCIDENT COMMAND LIST */}
        <aside className="col-span-4 bg-white/5 border border-white/10 rounded-xl overflow-y-auto">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold">
              Active Incidents
            </h2>
            <p className="text-xs text-slate-400">
              Sorted by operational priority
            </p>
          </div>

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
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{i.type}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      i.severity === "Critical"
                        ? "bg-red-500/20 text-red-300"
                        : i.severity === "Medium"
                        ? "bg-orange-500/20 text-orange-300"
                        : "bg-green-500/20 text-green-300"
                    }`}
                  >
                    {i.severity}
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex justify-between">
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

            {sorted.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-sm">
                No active incidents
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT — LIVE MAP */}
        <section className="col-span-8 bg-white rounded-xl overflow-hidden">
          <MapView focusIncident={selected} />
        </section>
      </div>
    </main>
  );
}

export default OperationsView;
