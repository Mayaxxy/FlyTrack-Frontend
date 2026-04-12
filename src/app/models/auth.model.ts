export type DocumentType = 'CC' | 'PASSPORT' | 'CE';

export interface RegisterRequest {
  documentType: DocumentType;
  documentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  birthDate: string; // ISO date: YYYY-MM-DD
  email: string;
  phone: string;
  password: string;
  acceptedDataPolicy: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  passenger: Passenger;
}

export interface Passenger {
  id: number;
  documentId: string;
  documentType: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  birthDate?: string;
  email: string;
  phone: string;
  role: string;
}
