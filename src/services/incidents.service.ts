import { db } from "./firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

/* =========================
   CREATE INCIDENT
========================= */
export const createIncident = async (incident: {
  type: string;
  severity: "Low" | "Medium" | "Critical";
  status: "Reported" | "Verified" | "Assigned" | "Resolved";
  location: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  sensorVerified?: boolean;
  verificationSource?: "IR_CAMERA" | "MANUAL";
}) => {
  await addDoc(collection(db, "incidents"), {
    ...incident,
    sensorVerified: false,
  });
};

/* =========================
   UPDATE STATUS
========================= */
export const updateIncidentStatus = async (
  id: string,
  status: "Reported" | "Verified" | "Assigned" | "Resolved"
) => {
  await updateDoc(doc(db, "incidents", id), { status });
};

/* =========================
   VERIFY VIA SENSOR
========================= */
export const verifyViaSensor = async (id: string) => {
  await updateDoc(doc(db, "incidents", id), {
    sensorVerified: true,
    verificationSource: "IR_CAMERA",
    status: "Verified",
  });
};
