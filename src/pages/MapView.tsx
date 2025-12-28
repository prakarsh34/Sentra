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
   AUTO FOCUS
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
   COMPONENT
===================== */
function MapView({ focusIncident }: MapViewProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  /* 🔥 FILTER STATE */
  const [filters, setFilters] = useState({
    Critical: true,
    Medium: true,
    Low: true,
    verifiedOnly: false,
  });

  useEffect(() => {
    return onSnapshot(collection(db, "incidents"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Incident, "id">),
        }))
        .filter(
          (i) =>
            typeof i.location?.lat === "number" &&
            typeof i.location?.lng === "number"
        );

      setIncidents(data);
    });
  }, []);

  /* 🔥 APPLY FILTERS */
  const visibleIncidents = incidents.filter((i) => {
    if (!filters[i.severity]) return false;
    if (filters.verifiedOnly && !i.sensorVerified) return false;
    return true;
  });

  const center: LatLngExpression = [20.5937, 78.9629];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-4">
        <h1 className="text-3xl font-semibold">Live Incident Map</h1>
        <p className="text-slate-400 text-sm">
          Real-time geographic awareness for responders
        </p>
      </div>

      {/* MAP */}
      <div className="w-full px-6 pb-6">
        <div
          className="relative w-full rounded-2xl overflow-hidden border border-white/10"
          style={{ height: "calc(100vh - 160px)" }}
        >
          {/* 🔥 FILTER CONTROLS */}
          <div className="absolute top-4 right-4 z-[1000] bg-black/70 backdrop-blur rounded-xl p-3 space-y-2 text-xs">
            {(["Critical", "Medium", "Low"] as const).map((sev) => (
              <label key={sev} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters[sev]}
                  onChange={() =>
                    setFilters((f) => ({ ...f, [sev]: !f[sev] }))
                  }
                />
                <span>{sev}</span>
              </label>
            ))}

            <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-white/10">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={() =>
                  setFilters((f) => ({
                    ...f,
                    verifiedOnly: !f.verifiedOnly,
                  }))
                }
              />
              <span>Verified only</span>
            </label>
          </div>

          <MapContainer center={center} zoom={5} className="h-full w-full">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="© OpenStreetMap, © CARTO"
            />

            <MapFocus incident={focusIncident} />

            {visibleIncidents.map((i) => (
              <div key={i.id}>
                <Circle
                  center={[i.location!.lat, i.location!.lng]}
                  radius={i.severity === "Critical" ? 12000 : 8000}
                  pathOptions={{
                    color: severityColor(i.severity),
                    fillColor: severityColor(i.severity),
                    fillOpacity: 0.15,
                    weight: 1,
                  }}
                />

                <Marker
                  position={[i.location!.lat, i.location!.lng]}
                  icon={severityIcon(i.severity)}
                >
                  <Popup>
                    <strong>{i.type}</strong>
                    <br />
                    Severity: {i.severity}
                    <br />
                    Status: {i.status}
                    {i.sensorVerified && (
                      <div className="text-indigo-400 text-xs">
                        ✔ Sensor verified
                      </div>
                    )}
                  </Popup>
                </Marker>
              </div>
            ))}
          </MapContainer>
        </div>
      </div>
    </main>
  );
}

/* =====================
   HELPERS
===================== */
function severityColor(sev: Incident["severity"]) {
  if (sev === "Critical") return "#ef4444";
  if (sev === "Medium") return "#facc15";
  return "#22c55e";
}

function severityIcon(sev: Incident["severity"]) {
  const color =
    sev === "Critical" ? "red" : sev === "Medium" ? "orange" : "green";

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

export default MapView;
