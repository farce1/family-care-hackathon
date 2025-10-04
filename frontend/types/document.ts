/**
 * Document type definitions for the family health management system
 */

export interface Document {
  id: string;
  title: string;
  appointment_type: DocumentType;
  date: Date;
  description?: string;
  fileUrl?: string;
  fileSize?: string;
  uploadedBy?: string;
}

export type DocumentType =
  | "Medical Record"
  | "Prescription"
  | "Lab Result"
  | "Vaccination"
  | "Imaging"
  | "Insurance"
  | "Referral"
  | "Diagnosis"
  | "Other";

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  initials: string;
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string[];
  accentColor: "orange" | "amber";
}

export interface DocumentGroup {
  monthYear: string; // Format: "January 2025"
  month: number; // 0-11
  year: number;
  documents: Document[];
}
