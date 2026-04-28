export interface BaggageReport {
  id: number;
  passenger: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    documentType: string;
    documentId: string;
  };
  flight: {
    id: number;
    flightCode: string;
  };
  description: string;
  status: BaggageReportStatus;
  createdAt: string;
}

export interface BaggageReportRequest {
  flightId: number;
  description: string;
}

export enum BaggageReportStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}
