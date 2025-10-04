"use client"

import { TextAnimate } from "@/components/ui/text-animate"
import { BookAppointmentDialog } from "@/components/book-appointment-dialog"
import { AppointmentReminderPopup } from "@/components/appointment-reminder-popup"
import { appointments, currentUser } from "@/lib/mock-data"
import { AppointmentsDataTable } from "@/components/appointments-data-table"
import { appointmentsTableColumns } from "@/components/appointments-table-columns"
import { useState, useEffect } from "react"

export default function AppointmentsPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showReminderPopup, setShowReminderPopup] = useState(false)

  // Split appointments by status
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "upcoming" && apt.dateTime > new Date()
  )
  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed"
  )
  const cancelledAppointments = appointments.filter(
    (apt) => apt.status === "cancelled" || apt.status === "rescheduled" || apt.status === "no-show"
  )
  const allAppointments = appointments

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
