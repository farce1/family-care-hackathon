"use client";

import { useQuery } from "@tanstack/react-query";
import { ParsedAppointment } from "@/types/parsed-appointment";
import { Document, DocumentType } from "@/types/document";
import { fetchParsedAppointments } from "@/lib/api/appointments";

/**
 * Format bytes to human-readable file size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Map appointment_type from backend to DocumentType for frontend
 */
function mapAppointmentTypeToDocumentType(appointmentType: string): DocumentType {
  if (appointmentType === "Lab Work") return "Lab Result";
  if (appointmentType === "Vaccination") return "Vaccination";
  if (appointmentType === "Other") return "Other";

  return "Medical Record";
}

/**
 * Transform ParsedAppointment to Document format for UI compatibility
 */
function transformToDocument(appointment: ParsedAppointment): Document {
  return {
    id: appointment.id,
    title: appointment.name,
    appointment_type: mapAppointmentTypeToDocumentType(appointment.appointment_type),
    date: new Date(appointment.date),
    description: appointment.summary || undefined,
    fileSize: formatFileSize(appointment.file_size),
    uploadedBy: appointment.doctor || undefined,
  };
}

/**
 * React Query hook to fetch and transform parsed appointments
 */
export function useParsedAppointments() {
  return useQuery({
    queryKey: ["parsed-appointments"],
    queryFn: fetchParsedAppointments,
    select: (data: ParsedAppointment[]): Document[] => {
      return data.map(transformToDocument);
    },
    staleTime: 60 * 1000, // 60 seconds - matches default config
    retry: 3, // Retry failed requests 3 times
  });
}
