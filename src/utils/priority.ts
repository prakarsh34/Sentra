import type { Timestamp } from "firebase/firestore";

export type Severity = "Low" | "Medium" | "Critical";
export type Status = "Reported" | "Verified" | "Assigned" | "Resolved";

/**
 * Calculates a dynamic priority score with explainable reasons.
 * This logic is intentionally transparent for operator trust.
 */
export function calculatePriorityWithReasons(
  severity: Severity,
  status: Status,
  createdAt: Date | Timestamp,
  sensorVerified: boolean = false
) {
  let score = 0;
  const reasons: string[] = [];

  /* =====================
     SEVERITY WEIGHT
  ===================== */
  switch (severity) {
    case "Critical":
      score += 120;
      reasons.push("Critical severity");
      break;
    case "Medium":
      score += 70;
      reasons.push("Medium severity");
      break;
    default:
      score += 30;
      reasons.push("Low severity");
  }

  /* =====================
     STATUS WEIGHT
  ===================== */
  if (status === "Resolved") {
    score -= 50;
    reasons.push("Incident resolved");
  } else {
    score += 40;
    reasons.push("Incident unresolved");
  }

  /* =====================
     TIME ESCALATION
  ===================== */
  const time =
    createdAt instanceof Date
      ? createdAt.getTime()
      : createdAt.toDate().getTime();

  const minutesAgo = Math.max(0, (Date.now() - time) / 60000);

  if (minutesAgo <= 5) {
    score += 25;
    reasons.push("Reported within last 5 minutes");
  } else if (minutesAgo <= 15) {
    score += 40;
    reasons.push("Incident escalating with time");
  } else if (minutesAgo <= 30) {
    score += 60;
    reasons.push("Delayed response risk");
  } else {
    score += 80;
    reasons.push("Critical delay — immediate action required");
  }

  /* =====================
     SENSOR VERIFICATION
  ===================== */
  if (sensorVerified) {
    score += 60;
    reasons.push("Sensor verified signal");
  } else {
    score -= 10;
    reasons.push("Awaiting sensor confirmation");
  }

  /* =====================
     FINAL NORMALIZATION
  ===================== */
  // Prevent negative or runaway scores
  score = Math.max(0, Math.min(Math.round(score), 1000));

  return { score, reasons };
}
