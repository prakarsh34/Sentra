import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

/* =====================
   TYPES
===================== */
interface Incident {
  id: string;
  type: string;
  severity: "Low" | "Medium" | "Critical";
  status: "Reported" | "Verified" | "Assigned" | "Resolved";
  location?: { lat: number; lng: number };
}

/* =====================
   MAP CONTROLLER
===================== */
function MapController({ focus }: { focus?: Incident | null }) {
  const map = useMap();

  useEffect(() => {
    requestAnimationFrame(() => {
      map.invalidateSize();
    });
  }, [map]);

  useEffect(() => {
    if (!focus?.location) return;
    map.flyTo(
      [focus.location.lat, focus.location.lng],
      14,
      { duration: 1.5 }
    );
  }, [focus, map]);

  return null;
}

/* =====================
   HEATMAP LAYER
===================== */
function HeatmapLayer({
  points,
}: {
  points: [number, number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heat = (L as any).heatLayer(points, {
      radius: 30,
      blur: 25,
      maxZoom: 10,
      gradient: {
        0.2: "#22c55e",
        0.5: "#facc15",
        0.9: "#ef4444",
      },
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

/* =====================
   HELPERS
===================== */
const severityColor = (s: Incident["severity"]) =>
  s === "Critical" ? "#ef4444" : s === "Medium" ? "#facc15" : "#22c55e";

const markerIcon = (severity: Incident["severity"]) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${
      severity === "Critical"
        ? "red"
        : severity === "Medium"
        ? "orange"
        : "green"
    }.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

/* =====================
   MAIN COMPONENT
===================== */
export default function MapView({
  focusIncident,
}: {
  focusIncident?: Incident | null;
}) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  /* =====================
     FIREBASE REALTIME
  ===================== */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "incidents"), (snap) => {
      const data = snap.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Incident, "id">),
        }))
        .filter((i) => i.location?.lat && i.location?.lng);

      setIncidents(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* =====================
     HEATMAP DATA (FIXED)
  ===================== */
  const heatPoints = useMemo<[number, number, number][]>(
    () =>
      incidents.map((i) => {
        const intensity =
          i.severity === "Critical"
            ? 1
            : i.severity === "Medium"
            ? 0.7
            : 0.4;

        return [
          i.location!.lat,
          i.location!.lng,
          intensity,
        ] as [number, number, number];
      }),
    [incidents]
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      {/* HEADER */}
      <div className="px-6 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">Spatial Intelligence</h1>
        <p className="text-xs uppercase tracking-widest text-slate-400">
          Live emergency awareness map
        </p>
      </div>

      {/* MAP */}
      <div className="px-6 pb-6">
        <div className="relative h-[calc(100vh-140px)] rounded-3xl overflow-hidden border border-white/10 bg-slate-900/60 shadow-2xl">
          {loading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-950/80">
              <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
            </div>
          )}

          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            className="absolute inset-0"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; CARTO"
            />

            <MapController focus={focusIncident} />
            <HeatmapLayer points={heatPoints} />

            {incidents.map((i) => (
              <div key={i.id}>
                {/* CRITICAL PULSE */}
                {i.severity === "Critical" && (
                  <Circle
                    center={[i.location!.lat, i.location!.lng]}
                    radius={12000}
                    pathOptions={{
                      color: "#ef4444",
                      fillColor: "#ef4444",
                      fillOpacity: 0.15,
                      weight: 1,
                      className: "pulse-ring",
                    }}
                  />
                )}

                <Marker
                  position={[i.location!.lat, i.location!.lng]}
                  icon={markerIcon(i.severity)}
                  opacity={i.status === "Resolved" ? 0.4 : 1}
                >
                  <Popup>
                    <div className="space-y-1">
                      <h3 className="font-bold">{i.type}</h3>
                      <p className="text-xs text-slate-500">{i.status}</p>
                      <span
                        className="inline-block px-2 py-0.5 text-xs font-bold rounded"
                        style={{
                          background: severityColor(i.severity) + "33",
                          color: severityColor(i.severity),
                        }}
                      >
                        {i.severity}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              </div>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* ANIMATION */}
      <style>{`
        .pulse-ring {
          animation: pulse 2.5s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.8; }
          70% { opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </main>
  );
}
