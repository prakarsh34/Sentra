import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import {
  updateIncidentStatus,
  verifyViaSensor,
} from "../services/incidents.service";
import { calculatePriorityWithReasons } from "../utils/priority";

interface Incident {
  id: string;
  type: string;
  severity: "Low" | "Medium" | "Critical";
  status: "Reported" | "Verified" | "Assigned" | "Resolved";
  createdAt: any;
  location: { lat: number; lng: number };
  sensorVerified?: boolean;
}

/* 🔹 Motivational quotes */
const QUOTES = [
  "Clarity saves time. Time saves lives.",
  "Every calm decision makes a difference.",
  "Respond with focus. Act with purpose.",
  "Information becomes impact when understood.",
  "Precision is the first step to safety.",
];

function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  /* Rotate quotes */
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

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
    return { ...i, priority: result.score, reasons: result.reasons };
  });

  const sorted = [...enriched].sort((a, b) => b.priority - a.priority);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 px-6 py-10">

      {/* ================= HEADER ================= */}
      <section className="max-w-7xl mx-auto mb-14">
        <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black border border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_60%)]" />

          <div className="relative">
            <h1 className="text-3xl font-semibold mb-3 tracking-tight">
              Emergency Operations Dashboard
            </h1>

            <p
              key={quoteIndex}
              className="text-sm italic text-slate-400 animate-fade-up"
            >
              “{QUOTES[quoteIndex]}”
            </p>
          </div>
        </div>
      </section>

      {/* ================= INCIDENT STREAM ================= */}
      <section className="max-w-7xl mx-auto space-y-5">
        {sorted.map((i) => (
          <div
            key={i.id}
            className="
              rounded-2xl border border-white/10
              bg-white/5 backdrop-blur
              px-6 py-5
              transition-all duration-300
              hover:bg-white/10 hover:scale-[1.01]
            "
          >
            {/* TOP ROW */}
            <div className="grid grid-cols-12 items-center gap-4">
              {/* TYPE */}
              <div className="col-span-2 font-medium tracking-wide">
                {i.type}
              </div>

              {/* SEVERITY */}
              <div
                className={`col-span-2 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full w-fit
                  ${
                    i.severity === "Critical"
                      ? "bg-red-500/20 text-red-300"
                      : i.severity === "Medium"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-green-500/20 text-green-300"
                  }`}
              >
                {i.severity}
              </div>

              {/* STATUS */}
              <div className="col-span-2 text-slate-300 text-sm">
                {i.status}
              </div>

              {/* PRIORITY */}
              <div className="col-span-2 text-2xl font-semibold text-teal-400">
                {i.priority}
              </div>

              {/* EXPLAIN */}
              <div className="col-span-2">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === i.id ? null : i.id)
                  }
                  className="text-xs uppercase tracking-widest text-teal-300 hover:underline"
                >
                  Explain
                </button>
              </div>

              {/* ACTIONS */}
              <div className="col-span-2 flex gap-2 justify-end">
                {!i.sensorVerified && i.type === "Smog" && (
                  <button
                    onClick={() => verifyViaSensor(i.id)}
                    className="
                      px-3 py-1 rounded-full text-xs
                      bg-indigo-500/20 text-indigo-300
                      border border-indigo-400/30
                      hover:bg-indigo-500/30 transition
                    "
                  >
                    Simulate IR
                  </button>
                )}

                {i.status !== "Resolved" && (
                  <button
                    onClick={() =>
                      updateIncidentStatus(i.id, "Resolved")
                    }
                    className="
                      px-3 py-1 rounded-full text-xs
                      bg-green-500/20 text-green-300
                      border border-green-400/30
                      hover:bg-green-500/30 transition
                    "
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>

            {/* PRIORITY EXPLANATION */}
            {expandedId === i.id && (
              <div className="mt-6 pl-6 border-l border-teal-400/30 animate-fade-up">
                <p className="text-[10px] uppercase tracking-widest text-teal-400 mb-3">
                  Priority breakdown
                </p>
                <ul className="list-disc ml-5 text-sm text-slate-300 space-y-1">
                  {i.reasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="text-center py-24 text-slate-500 text-sm">
            No incidents currently active
          </div>
        )}
      </section>

      {/* ================= FOOTNOTE ================= */}
      <footer className="max-w-7xl mx-auto mt-20 text-xs text-slate-500">
        * Sensor verification is simulated for demo purposes (IR / smog logic).
      </footer>
    </main>
  );
}

export default Dashboard;
