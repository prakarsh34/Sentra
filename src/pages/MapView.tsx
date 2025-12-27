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
  location: {
    lat: number;
    lng: number;
  };
  sensorVerified?: boolean;
}

interface MapViewProps {
  focusIncident?: Incident | null;
}

/* =====================
   FIX LEAFLET ICON PATHS
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
   MAP FOCUS CONTROLLER
===================== */
function MapFocus({ incident }: { incident?: Incident | null }) {
  const map = useMap();

  useEffect(() => {
    if (!incident) return;

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

  useEffect(() => {
    return onSnapshot(collection(db, "incidents"), (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data() as Omit<Incident, "id">;
        return { id: doc.id, ...d };
      });
      setIncidents(data);
    });
  }, []);

  const center: LatLngExpression = [20.5937, 78.9629]; // India

  return (
    <div className="h-full w-full relative">

      <MapContainer
        center={center}
        zoom={5}
        className="h-full w-full"
      >
        {/* DARK MAP */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="© OpenStreetMap, © CARTO"
        />

        {/* AUTO FOCUS */}
        <MapFocus incident={focusIncident} />

        {incidents.map((i) => {
          const position: LatLngExpression = [
            i.location.lat,
            i.location.lng,
          ];

          return (
            <div key={i.id}>
              {/* AWARENESS RING */}
              <Circle
                center={position}
                radius={i.severity === "Critical" ? 12000 : 8000}
                pathOptions={{
                  color: severityColor(i.severity),
                  fillColor: severityColor(i.severity),
                  fillOpacity: 0.15,
                  weight: 1,
                }}
              />

              {/* MARKER */}
              <Marker
                position={position}
                icon={severityIcon(i.severity)}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{i.type}</strong>
                    <br />
                    Severity: {i.severity}
                    <br />
                    Status: {i.status}
                    <br />
                    {i.sensorVerified
                      ? "Sensor verified (IR)"
                      : "Awaiting sensor verification"}
                  </div>
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
