export type Severity = "Low" | "Medium" | "Critical";

export type Status =
  | "Reported"
  | "Verified"
  | "Assigned"
  | "Resolved";

export interface Incident {
  id: string;
  type: string;
  severity: Severity;
  status: Status;
  createdAt: any;
  location: {
    lat: number;
    lng: number;
  };
  sensorVerified?: boolean;
}
