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
  crowdVerifyCount?: number;
  priority?: number;
  reasons?: string[];
  isDuplicate?: boolean;
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
   ACCURATE CITY RESOLUTION
===================== */
function formatLocation(loc?: { lat: number; lng: number }) {
  if (!loc) return "Unknown Region";

  const { lat, lng } = loc;

  // ---- Delhi NCR ----
  if (lat >= 28.4 && lat <= 28.9 && lng >= 76.8 && lng <= 77.4)
    return "Delhi NCR";

  // ---- Mumbai Metropolitan Region ----
  if (lat >= 18.8 && lat <= 19.4 && lng >= 72.7 && lng <= 73.1)
    return "Mumbai Metropolitan";

  // ---- Bengaluru Urban ----
  if (lat >= 12.8 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8)
    return "Bengaluru Urban";

  // ---- Chennai ----
  if (lat >= 12.9 && lat <= 13.3 && lng >= 80.1 && lng <= 80.4)
    return "Chennai City";

  // ---- Kolkata ----
  if (lat >= 22.4 && lat <= 22.7 && lng >= 88.2 && lng <= 88.5)
    return "Kolkata City";

  // ---- Hyderabad ----
  if (lat >= 17.2 && lat <= 17.6 && lng >= 78.2 && lng <= 78.7)
    return "Hyderabad Region";

  // ---- Pune ----
  if (lat >= 18.4 && lat <= 18.7 && lng >= 73.7 && lng <= 74.0)
    return "Pune City";

  // ---- Generic fallback (never coordinates) ----
  return "Regional Jurisdiction";
}

/* =====================
   COMPONENT
===================== */
export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const [timeWindow, setTimeWindow] = useState<"15m" | "1h" | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [radiusKm, setRadiusKm] = useState(1000);

  const SESSION_ID =
    sessionStorage.getItem("sentra_user") ??
    (() => {
      const id = crypto.randomUUID();
      sessionStorage.setItem("sentra_user", id);
      return id;
    })();

  useEffect(() => {
    const t = setInterval(
      () => setQuoteIndex((i) => (i + 1) % QUOTES.length),
      6000
    );
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "incidents"), (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setIncidents(data);
    });
    return () => unsubscribe();
  }, []);

  /* =====================
      PROCESSING
  ===================== */
  const now = Date.now();

  const processed = incidents
    .filter((i) => {
      if (typeFilter !== "all" && i.type !== typeFilter) return false;

      const createdDate = safeDate(i.createdAt);
      const diffMs = now - createdDate.getTime();
      if (timeWindow === "15m" && diffMs > 15 * 60 * 1000) return false;
      if (timeWindow === "1h" && diffMs > 60 * 60 * 1000) return false;

      if (i.location) {
        const d = distanceKm(
          RESPONDER_CENTER.lat,
          RESPONDER_CENTER.lng,
          i.location.lat,
          i.location.lng
        );
        if (d > radiusKm) return false;
      }

      return true;
    })
    .map((i, idx, self) => {
      const result = calculatePriorityWithReasons(
        i.severity || "Low",
        i.status || "Reported",
        safeDate(i.createdAt),
        i.sensorVerified || false
      );

      const isDuplicate = isPotentialDuplicate(
        i,
        self.filter((_, index) => index !== idx)
      );

      return {
        ...i,
        priority: result.score,
        reasons: isDuplicate
          ? ["⚠️ Possible duplicate incident", ...result.reasons]
          : result.reasons,
        isDuplicate,
      };
    });

  const sorted = [...processed].sort((a, b) => b.priority! - a.priority!);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 px-6 py-10">
      {/* HEADER */}
      <section className="max-w-7xl mx-auto mb-10">
        <div className="rounded-3xl p-8 bg-slate-900 border border-white/10 shadow-2xl">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Emergency Operations Dashboard
          </h1>
          <p className="text-sm italic text-slate-400 mt-2">
            “{QUOTES[quoteIndex]}”
          </p>
        </div>
      </section>

      {/* INCIDENT LIST */}
      <section className="max-w-7xl mx-auto space-y-4">
        {sorted.map((i) => (
          <div
            key={i.id}
            className="relative rounded-2xl bg-slate-900/40 border border-white/10 px-7 py-6 overflow-hidden"
          >
            {/* Accent Strip */}
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                i.severity === "Critical"
                  ? "bg-red-500"
                  : i.severity === "Medium"
                  ? "bg-orange-400"
                  : "bg-emerald-400"
              }`}
            />

            <div className="grid grid-cols-12 gap-6 items-center">
              {/* INCIDENT + LOCATION */}
              <div className="col-span-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{i.type}</span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-slate-300">
                    📍 {formatLocation(i.location)}
                  </span>
                </div>
              </div>

              {/* PRIORITY */}
              <div className="col-span-2 text-center">
                <span className="text-[10px] uppercase text-slate-500 font-bold">
                  Priority
                </span>
                <p className="text-3xl font-black text-teal-400">
                  {i.priority}
                </p>
              </div>

              {/* REASONS */}
              <div className="col-span-3 text-xs text-slate-400">
                {i.reasons?.slice(0, 2).join(" • ")}
              </div>

              {/* ACTIONS */}
              <div className="col-span-3 flex justify-end gap-2">
                {!i.sensorVerified && (
                  <button
                    onClick={() => crowdVerifyIncident(i.id, SESSION_ID)}
                    className="px-3 py-2 text-[10px] bg-white/5 border border-white/10 rounded-lg"
                  >
                    👥 Verify ({i.crowdVerifyCount || 0})
                  </button>
                )}

                {i.type === "Smog" && !i.sensorVerified && (
                  <button
                    onClick={() => verifyViaSensor(i.id)}
                    className="px-4 py-2 text-[10px] bg-indigo-600 rounded-lg"
                  >
                    IR Sensor
                  </button>
                )}

                {i.status !== "Resolved" && (
                  <button
                    onClick={() => updateIncidentStatus(i.id, "Resolved")}
                    className="px-4 py-2 text-[10px] bg-emerald-600 rounded-lg"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
