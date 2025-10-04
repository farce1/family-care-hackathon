/**
 * Type definitions for parsed appointments from the backend API
 */

export interface ParsedAppointment {
  id: string;
  original_filename: string;
  name: string;
  date: string; // ISO format string from backend
  appointment_type: string;
  summary: string | null;
  doctor: string | null;
  file_size: number;
  processing_status: string;
  confidence_score: number;
  created_at: string; // ISO format string from backend
  updated_at: string; // ISO format string from backend
}

/**
 * Transforms a ParsedAppointment to the Document interface used in the UI
 */
export interface ParsedAppointmentDocument {
  id: string;
  title: string; // maps from 'name'
  type: string; // maps from 'appointment_type'
  date: Date; // parsed from ISO string
  description?: string; // maps from 'summary'
  fileSize?: string; // formatted from 'file_size' bytes
  uploadedBy?: string; // maps from 'doctor'
}
