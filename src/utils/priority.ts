import type { Timestamp } from "firebase/firestore";

export type Severity = "Low" | "Medium" | "Critical";
export type Status = "Reported" | "Verified" | "Assigned" | "Resolved";

export function calculatePriorityWithReasons(
  severity: Severity,
  status: Status,
  createdAt: Date | Timestamp,
  sensorVerified?: boolean
) {
  let score = 0;
  const reasons: string[] = [];

  // Severity
  if (severity === "Critical") {
    score += 100;
    reasons.push("Critical severity");
  } else if (severity === "Medium") {
    score += 60;
    reasons.push("Medium severity");
  } else {
    score += 30;
    reasons.push("Low severity");
  }

  // Status
  if (status !== "Resolved") {
    score += 40;
    reasons.push("Incident unresolved");
  }

  // Time
  const time =
    createdAt instanceof Date
      ? createdAt.getTime()
      : createdAt.toDate().getTime();

  const minutesAgo = (Date.now() - time) / 60000;
  if (minutesAgo < 10) {
    score += 20;
    reasons.push("Reported recently");
  }

  // Sensor verification
  if (sensorVerified) {
    score += 50;
    reasons.push("IR sensor verified (simulated)");
  }

  return { score, reasons };
}
