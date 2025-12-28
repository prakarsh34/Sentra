import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import {
  updateIncidentStatus,
  verifyViaSensor,
  crowdVerifyIncident,
} from "../services/incidents.service";
import { calculatePriorityWithReasons } from "../utils/priority";
import { isPotentialDuplicate } from "../utils/deduplication";

/* =====================
   TYPES
===================== */
interface Incident {
  id: string;
  type?: string;
  severity?: "Low" | "Medium" | "Critical";
  status?: "Reported" | "Verified" | "Assigned" | "Resolved";
  createdAt?: any;
  location?: { lat: number; lng: number };
  sensorVerified?: boolean;
  crowdVerifyCount?: number; // Added for crowd-sourcing logic
}

/* =====================
   CONSTANTS
===================== */
const QUOTES = [
  "Clarity saves time. Time saves lives.",
  "Every calm decision makes a difference.",
  "Respond with focus. Act with purpose.",
  "Information becomes impact when understood.",
  "Precision is the first step to safety.",
];

const RESPONDER_CENTER = { lat: 20.5937, lng: 78.9629 };

/* =====================
   HELPERS
===================== */
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

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* =====================
   COMPONENT
===================== */
export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const [timeWindow, setTimeWindow] = useState<"15m" | "1h" | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [radiusKm, setRadiusKm] = useState(100);

  // Generate or retrieve persistent Session ID for crowd verification tracking
  const SESSION_ID = sessionStorage.getItem("sentra_user") ?? 
    (() => {
      const id = crypto.randomUUID();
      sessionStorage.setItem("sentra_user", id);
      return id;
    })();

  useEffect(() => {
    const t = setInterval(() => setQuoteIndex((i) => (i + 1) % QUOTES.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "incidents"),
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));
        setIncidents(data);
      },
      (err) => console.error("❌ Firestore Sync Error:", err)
    );
    return () => unsubscribe();
  }, []);

  /* =====================
      PROCESSING (Filter + Dedupe + Enrich)
  ===================== */
  const now = Date.now();

  const processed = incidents
    .filter((i) => {
      if (typeFilter !== "all" && i.type !== typeFilter) return false;
      const createdDate = safeDate(i.createdAt);
      const diffMs = now - createdDate.getTime();
      if (timeWindow === "15m" && diffMs > 15 * 60 * 1000) return false;
      if (timeWindow === "1h" && diffMs > 60 * 60 * 1000) return false;
      if (i.location?.lat && i.location?.lng) {
        const d = distanceKm(RESPONDER_CENTER.lat, RESPONDER_CENTER.lng, i.location.lat, i.location.lng);
        if (d > radiusKm) return false;
      }
      return true;
    })
    .map((i, idx, self) => {
      // 1. Calculate Priority
      let score = 0;
      let reasons: string[] = [];
      try {
        const result = calculatePriorityWithReasons(
          i.severity || "Low",
          i.status || "Reported",
          safeDate(i.createdAt),
          i.sensorVerified || false
        );
        score = result.score;
        reasons = result.reasons;
      } catch (e) {
        score = 0;
        reasons = ["Priority unavailable"];
      }

      // 2. Check for potential duplicates (Deduplication)
      const isDuplicate = isPotentialDuplicate(i, self.filter((_, index) => index !== idx));
      if (isDuplicate) reasons.unshift("⚠️ Flagged as potential duplicate");

      return { ...i, priority: score, reasons, isDuplicate };
    });

  const sorted = [...processed].sort((a, b) => b.priority - a.priority);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 px-6 py-10 font-sans">
      <section className="max-w-7xl mx-auto mb-10">
        <div className="rounded-3xl p-8 bg-slate-900 border border-white/10 shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                Emergency Operations Dashboard
              </h1>
              <p className="text-sm italic text-slate-400">“{QUOTES[quoteIndex]}”</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Session Active</span>
              <span className="text-xs font-mono text-slate-400">{SESSION_ID.split('-')[0]}</span>
            </div>
          </div>

          {/* DASHBOARD CONTROLS */}
          <div className="mt-8 flex flex-wrap gap-5 items-center">
            <div className="flex p-1 bg-slate-800 rounded-xl border border-white/5">
              {(["15m", "1h", "all"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeWindow(t)}
                  className={`px-5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    timeWindow === t ? "bg-teal-500 text-slate-900 shadow-lg" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-800 border border-white/10 px-4 py-2 rounded-xl text-xs outline-none focus:ring-2 ring-teal-500/50"
            >
              <option value="all">All Incident Types</option>
              <option value="Accident">Accident</option>
              <option value="Medical">Medical</option>
              <option value="Fire">Fire</option>
              <option value="Smog">Smog</option>
            </select>

            <div className="flex items-center gap-4 bg-slate-800/40 px-5 py-2 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400">Range:</span>
              <input
                type="range"
                min={1}
                max={1000}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-32 accent-teal-500"
              />
              <span className="text-xs font-mono text-teal-400 w-14">{radiusKm}km</span>
            </div>
          </div>
        </div>
      </section>

      {/* INCIDENT FEED */}
      <section className="max-w-7xl mx-auto space-y-4">
        {sorted.map((i) => (
          <div
            key={i.id}
            className={`rounded-2xl border transition-all duration-300 ${
              expandedId === i.id ? "bg-slate-900 border-teal-500/50" : "bg-slate-900/40 border-white/5 hover:border-white/10"
            } px-7 py-6`}
          >
            <div className="grid grid-cols-12 gap-6 items-center">
              <div className="col-span-2">
                <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Category</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{i.type || "Undefined"}</span>
                  {i.isDuplicate && (
                    <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">DUPE</span>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Severity</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  i.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {i.severity || "Low"}
                </span>
              </div>

              <div className="col-span-2 text-center">
                <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Priority Score</span>
                <span className="text-2xl font-mono font-bold text-teal-400">{i.priority}</span>
              </div>

              <div className="col-span-2">
                <button
                  onClick={() => setExpandedId(expandedId === i.id ? null : i.id)}
                  className="text-xs font-medium text-teal-500 hover:text-teal-300 transition-colors"
                >
                  {expandedId === i.id ? "Close Insight" : "View Analysis"}
                </button>
              </div>

              <div className="col-span-4 flex gap-2 justify-end">
                {/* Crowd Verification Option */}
                {!i.sensorVerified && i.status !== "Resolved" && (
                  <button
                    onClick={() => crowdVerifyIncident(i.id, SESSION_ID)}
                    className="px-3 py-2 text-[10px] font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors uppercase flex items-center gap-2"
                  >
                    👥 Verify ({i.crowdVerifyCount || 0})
                  </button>
                )}

                {/* Sensor Verification Logic */}
                {!i.sensorVerified && i.type === "Smog" && (
                  <button
                    onClick={() => verifyViaSensor(i.id)}
                    className="px-4 py-2 text-[10px] font-bold bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors uppercase"
                  >
                    IR Sensor
                  </button>
                )}

                {/* Resolution Logic */}
                {i.status !== "Resolved" && (
                  <button
                    onClick={() => updateIncidentStatus(i.id, "Resolved")}
                    className="px-4 py-2 text-[10px] font-bold bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors uppercase"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>

            {/* EXPANDED REASONING */}
            {expandedId === i.id && (
              <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-[10px] uppercase text-slate-500 font-black mb-3 tracking-widest">Decision Matrix Analysis</h4>
                <div className="grid grid-cols-2 gap-3">
                  {i.reasons.map((r, idx) => (
                    <div key={idx} className={`flex items-center gap-3 text-xs p-2 rounded-lg ${r.includes('⚠️') ? 'bg-amber-500/10 text-amber-200' : 'bg-white/5 text-slate-400'}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${r.includes('⚠️') ? 'bg-amber-400' : 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]'}`}></div>
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="text-center py-32 rounded-3xl border-2 border-dashed border-white/5">
            <div className="text-slate-600 text-sm mb-4">No incidents match your current mission filters.</div>
            <button 
              onClick={() => { setTypeFilter("all"); setTimeWindow("all"); setRadiusKm(1000); }}
              className="text-teal-500 text-xs font-bold hover:underline"
            >
              RESET COMMAND VIEW
            </button>
          </div>
        )}
      </section>
    </main>
  );
}