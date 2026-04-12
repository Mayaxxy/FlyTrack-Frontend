export interface BaggageReport {
  id: number;
  passengerId: number;
  flightCode: string;
  description: string;
  baggageTag: string;
  status: BaggageReportStatus;
  createdAt: string;
}

export interface BaggageReportRequest {
  flightCode: string;
  description: string;
  baggageTag: string;
}

export enum BaggageReportStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}
