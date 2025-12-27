import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
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
   COMPONENT
===================== */
function MapView() {
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
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">
        🗺️ Live Incident Map
      </h1>

      <div className="h-[75vh] rounded-xl overflow-hidden shadow">
        <MapContainer
          center={center}
          zoom={5}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          {incidents.map((i) => {
            const position: LatLngExpression = [
              i.location.lat,
              i.location.lng,
            ];

            return (
              <Marker
                key={i.id}
                position={position}
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
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

/* =====================
   SEVERITY ICONS
===================== */
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

export default MapView;
