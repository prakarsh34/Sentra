export type IncidentType =
  | "Accident"
  | "Medical"
  | "Fire"
  | "Smog";

export type IncidentSeverity =
  | "Low"
  | "Medium"
  | "Critical";

export type IncidentStatus =
  | "Reported"
  | "Verified"
  | "Assigned"
  | "Resolved";

export interface Incident {
  id?: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
}
