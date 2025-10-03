/**
 * Appointment type definitions for the family health management system
 */

export type AppointmentType =
  | "General Checkup"
  | "Dental"
  | "Vision"
  | "Specialist"
  | "Vaccination"
  | "Follow-up"
  | "Emergency"
  | "Lab Work"
  | "Physical Therapy"
  | "Mental Health"
  | "Veterinary";

export type AppointmentStatus =
  | "upcoming"
  | "completed"
  | "cancelled"
  | "rescheduled"
  | "no-show";

export interface Appointment {
  id: string;
  familyMemberId: string;
  familyMemberName: string;
  facilityName: string;
  facilityAddress?: string;
  appointmentType: AppointmentType;
  dateTime: Date;
  status: AppointmentStatus;
  notes?: string;
  doctorName?: string;
  duration?: number; // in minutes
  reminder?: boolean;
  accentColor?: "orange" | "amber";
}

export interface AppointmentFormData {
  appointmentType: AppointmentType;
  date: Date;
  city: string;
  familyMemberId?: string;
  notes?: string;
}
