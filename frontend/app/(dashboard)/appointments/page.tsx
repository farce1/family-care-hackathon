"use client"

import { TextAnimate } from "@/components/ui/text-animate"
import { BookAppointmentDialog } from "@/components/book-appointment-dialog"
import { AppointmentReminderPopup } from "@/components/appointment-reminder-popup"
import { appointments, currentUser } from "@/lib/mock-data"
import { AppointmentsDataTable } from "@/components/appointments-data-table"
import { appointmentsTableColumns } from "@/components/appointments-table-columns"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getApiBaseUrl, API_ENDPOINTS } from "@/lib/api/config"
import { Appointment } from "@/types/appointment"

export default function AppointmentsPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showReminderPopup, setShowReminderPopup] = useState(false)

  // Fetch upcoming appointments from backend
  const { data: backendAppointments = [] } = useQuery({
    queryKey: ['upcoming-appointments'],
    queryFn: async () => {
      const baseUrl = getApiBaseUrl()
      const url = `${baseUrl}${API_ENDPOINTS.UPCOMING_APPOINTMENTS}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch upcoming appointments')
        return []
      }

      const data = await response.json()
      const appointmentsList = data.appointments || []

      // Define type for backend appointment
      interface BackendAppointment {
        id?: string
        nfz_id?: string
        provider?: string
        place?: string
        address?: string
        locality?: string
        date: string
        average_wait_days?: number
      }

      // Transform backend appointments to match Appointment interface
      return appointmentsList.map((apt: BackendAppointment): Appointment => ({
        id: apt.id || apt.nfz_id || `nfz-${Date.now()}-${Math.random()}`,
        familyMemberId: "current", // Adam Kowalski - Father
        familyMemberName: "Adam Kowalski",
        facilityName: apt.provider || apt.place || "Unknown Facility",
        facilityAddress: apt.address,
        appointmentType: "Specialist",
        dateTime: new Date(apt.date),
        status: "upcoming",
        doctorName: apt.place,
        notes: `${apt.locality || ''} - Wait time: ${apt.average_wait_days || 0} days`,
        accentColor: "orange" as const,
      }))
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Combine backend and mock appointments (backend first)
  const allCombinedAppointments = [...backendAppointments, ...appointments]

  // Split appointments by status and sort
  const upcomingAppointments = allCombinedAppointments
    .filter((apt) => apt.status === "upcoming" && apt.dateTime > new Date())
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()) // Sort by date ascending (earliest first)

  const completedAppointments = allCombinedAppointments
    .filter((apt) => apt.status === "completed")
    .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime()) // Sort by date descending (most recent first)

  const cancelledAppointments = allCombinedAppointments
    .filter((apt) => apt.status === "cancelled" || apt.status === "rescheduled" || apt.status === "no-show")
    .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime()) // Sort by date descending

  const allAppointments = allCombinedAppointments.sort((a, b) => {
    // Sort by status priority: upcoming first, then completed, then cancelled
    const statusPriority: Record<string, number> = {
      upcoming: 1,
      completed: 2,
      cancelled: 3,
      rescheduled: 3,
      "no-show": 3
    }
    const aPriority = statusPriority[a.status] || 4
    const bPriority = statusPriority[b.status] || 4

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // Within same status, sort upcoming by date ascending, others by date descending
    if (a.status === "upcoming") {
      return a.dateTime.getTime() - b.dateTime.getTime()
    }
    return b.dateTime.getTime() - a.dateTime.getTime()
  })

  // Check for completed appointments older than 30 days and show reminder
  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const oldCompletedAppointments = completedAppointments.filter(
      (apt) => apt.dateTime < thirtyDaysAgo
    );

    if (oldCompletedAppointments.length > 0) {
      // Show popup after a short delay to let the page load
      const timer = setTimeout(() => {
        setShowReminderPopup(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [completedAppointments]);

  // Get filtered data based on selection
  const getFilteredData = () => {
    switch (selectedFilter) {
      case "upcoming":
        return upcomingAppointments
      case "completed":
        return completedAppointments
      case "cancelled":
        return cancelledAppointments
      default:
        return allAppointments
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <TextAnimate
              animation="blurIn"
              by="word"
              className="text-3xl sm:text-4xl font-bold text-primary mb-2 font-[family-name:var(--font-quicksand)]"
            >
              Appointments
            </TextAnimate>
            <p className="text-muted-foreground text-base sm:text-lg">
              Manage your family&apos;s medical appointments
            </p>
          </div>
          <BookAppointmentDialog />
        </div>

        {/* Table with integrated filter */}
        <AppointmentsDataTable
          columns={appointmentsTableColumns}
          data={getFilteredData()}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          filterOptions={[
            { value: "all", label: `All (${allAppointments.length})` },
            { value: "upcoming", label: `Upcoming (${upcomingAppointments.length})` },
            { value: "completed", label: `Completed (${completedAppointments.length})` },
            { value: "cancelled", label: `Other (${cancelledAppointments.length})` },
          ]}
        />

        {/* Appointment Reminder Popup */}
        <AppointmentReminderPopup
          appointments={completedAppointments}
          isOpen={showReminderPopup}
          onClose={() => setShowReminderPopup(false)}
        />
      </div>
    </div>
  )
}
