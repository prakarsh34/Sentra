import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

/* =====================
   TYPES
===================== */
interface Incident {
  id: string;
  type: string;
  severity: "Low" | "Medium" | "Critical";
  status: string;
  location?: {
    lat: number;
    lng: number;
  };
  sensorVerified?: boolean;
}

interface MapViewProps {
  focusIncident?: Incident | null;
}

/* =====================
   LEAFLET ICON FIX
===================== */
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* =====================
   AUTO FOCUS CONTROLLER
===================== */
function MapFocus({ incident }: { incident?: Incident | null }) {
  const map = useMap();

  useEffect(() => {
    if (!incident || !incident.location) return;

    map.flyTo(
      [incident.location.lat, incident.location.lng],
      11,
      { duration: 1.2 }
    );
  }, [incident, map]);

  return null;
}

/* =====================
   HELPER — OFFSET MARKERS
===================== */
function offsetLatLng(
  lat: number,
  lng: number,
  index: number
): [number, number] {
  const spread = 0.002;
  return [
    lat + (index % 3) * spread,
    lng + Math.floor(index / 3) * spread,
  ];
}

/* =====================
   COMPONENT
===================== */
function MapView({ focusIncident }: MapViewProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    return onSnapshot(collection(db, "incidents"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Incident, "id">),
        }))
        // 🔥 REMOVE INCIDENTS WITHOUT LOCATION
        .filter(
          (i) =>
            typeof i.location?.lat === "number" &&
            typeof i.location?.lng === "number"
        );

      setIncidents(data);
    });
  }, []);

  const center: LatLngExpression = [20.5937, 78.9629]; // India

 return (
  <main className="min-h-screen bg-[#020617] text-slate-100">
    {/* PAGE HEADER */}
    <div className="max-w-7xl mx-auto px-6 pt-6 pb-4">
      <h1 className="text-3xl font-semibold mb-1">
        Live Incident Map
      </h1>
      <p className="text-slate-400 text-sm">
        Real-time geographic view of all reported incidents
      </p>
    </div>

    {/* MAP WRAPPER — FIXED HEIGHT */}
    <div className="w-full px-6 pb-6">
      <div
        className="
          relative
          w-full
          rounded-2xl
          overflow-hidden
          border border-white/10
        "
        style={{
          height: "calc(100vh - 160px)", // 🔥 KEY FIX
        }}
      >
        <MapContainer
          center={center}
          zoom={5}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="© OpenStreetMap, © CARTO"
          />

          <MapFocus incident={focusIncident} />

          {incidents.map((i, idx) => {
            if (!i.location) return null;

            const [lat, lng] = offsetLatLng(
              i.location.lat,
              i.location.lng,
              idx
            );

            return (
              <div key={i.id}>
                <Circle
                  center={[lat, lng]}
                  radius={i.severity === "Critical" ? 12000 : 8000}
                  pathOptions={{
                    color: severityColor(i.severity),
                    fillColor: severityColor(i.severity),
                    fillOpacity: 0.15,
                    weight: 1,
                  }}
                />

                <Marker
                  position={[lat, lng]}
                  icon={severityIcon(i.severity)}
                >
                  <Popup>
                    <strong>{i.type}</strong>
                    <br />
                    Severity: {i.severity}
                    <br />
                    Status: {i.status}
                  </Popup>
                </Marker>
              </div>
            );
          })}
        </MapContainer>

        {/* LEGEND */}
        <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur border border-white/10 rounded-xl p-4 text-xs space-y-2 text-slate-100">
          <p className="uppercase tracking-widest text-slate-400">
            Legend
          </p>
          <LegendItem color="bg-red-500" label="Critical" />
          <LegendItem color="bg-yellow-400" label="Medium" />
          <LegendItem color="bg-green-500" label="Low" />
        </div>
      </div>
    </div>
  </main>
);
}


/* =====================
   HELPERS
===================== */
function severityColor(severity: Incident["severity"]) {
  if (severity === "Critical") return "#ef4444";
  if (severity === "Medium") return "#facc15";
  return "#22c55e";
}

function severityIcon(severity: Incident["severity"]) {
  const color =
    severity === "Critical"
      ? "red"
      : severity === "Medium"
      ? "orange"
      : "green";

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

function LegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

export default MapView;
