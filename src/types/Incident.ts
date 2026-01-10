// Severity level
export type Severity = "Low" | "Medium" | "Critical";

// Incident lifecycle status
export type Status =
  | "Reported"
  | "Verified"
  | "Assigned"
  | "Resolved";

// Supported incident categories
export type IncidentType =
  | "Smog"
  | "Fire"
  | "Medical"
  | "Accident";

// Core Incident interface
export interface Incident {
  id: string;
  type: IncidentType;
  severity: Severity;
  status: Status;
  priority: number;
  createdAt: number;
  location: {
    lat: number;
    lng: number;
    label?: string;
  };
  sensorVerified?: boolean;
  confidence?: number;
}
