import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  increment,
  getDoc,
} from "firebase/firestore";

export type Status =
  | "Reported"
  | "Verified"
  | "Assigned"
  | "Resolved";

/* =====================
   CREATE INCIDENT
===================== */
export const createIncident = async (incident: any) => {
  await addDoc(collection(db, "incidents"), {
    ...incident,
    status: "Reported",
    crowdVerifyCount: 0,     // ✅ FIXED
    crowdVerifiedBy: [],     // ✅ FIXED
    sensorVerified: false,
  });
};

/* =====================
   CROWD VERIFY (FIXED)
===================== */
export const crowdVerifyIncident = async (
  id: string,
  userId: string
) => {
  const ref = doc(db, "incidents", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  // 🛑 Prevent same user/session verifying twice
  if (data.crowdVerifiedBy?.includes(userId)) {
    console.warn("Already verified by this session");
    return;
  }

  await updateDoc(ref, {
    crowdVerifyCount: increment(1),          // ✅ FIXED
    crowdVerifiedBy: arrayUnion(userId),     // ✅ FIXED
    status: "Verified",                      // Optional escalation
  });
};

/* =====================
   SENSOR VERIFY
===================== */
export const verifyViaSensor = async (id: string) => {
  await updateDoc(doc(db, "incidents", id), {
    sensorVerified: true,
    status: "Verified",
  });
};

/* =====================
   STATUS UPDATE
===================== */
export const updateIncidentStatus = async (
  id: string,
  status: Status
) => {
  await updateDoc(doc(db, "incidents", id), { status });
};
