"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, AlertTriangle, X, RefreshCw } from "lucide-react"
import { Appointment } from "@/types/appointment"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AppointmentReminderPopupProps {
  appointments: Appointment[]
  isOpen: boolean
  onClose: () => void
  onBookNew?: () => void
}

export function AppointmentReminderPopup({
  appointments,
  isOpen,
  onClose,
  onBookNew,
}: AppointmentReminderPopupProps) {
  const [reminderAppointments, setReminderAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    // Filter completed appointments that are older than 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const oldCompletedAppointments = appointments.filter(
      (apt) => 
        apt.status === "completed" && 
        apt.dateTime < thirtyDaysAgo
    )

    // Filter out appointments that have already been shown
    const unseenAppointments = oldCompletedAppointments.filter((apt) => {
      const reminderKey = `appointment_reminder_${apt.id}`
      return !localStorage.getItem(reminderKey)
    })

    setReminderAppointments(unseenAppointments)
  }, [appointments])

  if (reminderAppointments.length === 0) {
    return null
  }

  const formatAppointmentDate = (date: Date) => {
    return format(date, "MMM dd, yyyy")
  }

  const formatAppointmentTime = (date: Date) => {
    return format(date, "h:mm a")
  }

  const getDaysSinceAppointment = (date: Date) => {
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const markAppointmentsAsSeen = () => {
    reminderAppointments.forEach((apt) => {
      const reminderKey = `appointment_reminder_${apt.id}`
      localStorage.setItem(reminderKey, 'seen')
    })
  }

  const handleClose = () => {
    markAppointmentsAsSeen()
    onClose()
  }

  const handleBookNew = () => {
    markAppointmentsAsSeen()
    if (onBookNew) {
      onBookNew()
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-2xl">
              <RefreshCw className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-primary font-[family-name:var(--font-quicksand)]">
                Przypomnienie o badaniach
              </DialogTitle>
              <DialogDescription className="text-base">
                Ostatnie badania zostały wykonane ponad 30 dni temu. 
                Może warto rozważyć powtórzenie niektórych z nich?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-6 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-50">
          {reminderAppointments.map((appointment) => {
            const daysSince = getDaysSinceAppointment(appointment.dateTime)
            return (
              <div
                key={appointment.id}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all duration-200 shadow-sm",
                  appointment.accentColor === "orange"
                    ? "border-orange-200 bg-orange-50/50 hover:bg-orange-50 hover:shadow-md"
                    : "border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:shadow-md"
                )}
              >
                <div className="space-y-4">
                  {/* Main Question */}
                  <div className="text-center">
                    <p className="text-lg font-medium text-foreground mb-2">
                      Może chciałbyś powtórzyć badanie{" "}
                      <span className="font-bold text-primary">
                        {appointment.appointmentType}
                      </span>
                      {" "}dla{" "}
                      <span className="font-semibold text-primary">
                        {appointment.familyMemberName}
                      </span>
                      ?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ostatnie badanie wykonane {daysSince} dni temu
                    </p>
                  </div>

                  {/* Appointment Details */}
                  <div className="bg-white/60 rounded-2xl p-4 space-y-3">
                    {/* Patient Name */}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {appointment.familyMemberName}
                      </span>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar
                          className={cn(
                            "w-4 h-4",
                            appointment.accentColor === "orange"
                              ? "text-orange-600"
                              : "text-amber-600"
                          )}
                        />
                        <span className="text-sm text-muted-foreground">
                          {formatAppointmentDate(appointment.dateTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock
                          className={cn(
                            "w-4 h-4",
                            appointment.accentColor === "orange"
                              ? "text-orange-600"
                              : "text-amber-600"
                          )}
                        />
                        <span className="text-sm text-muted-foreground">
                          {formatAppointmentTime(appointment.dateTime)}
                        </span>
                      </div>
                    </div>

                    {/* Doctor and Facility */}
                    <div className="space-y-1">
                      {appointment.doctorName && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Lekarz: </span>
                          <span className="font-medium">{appointment.doctorName}</span>
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="text-muted-foreground">Placówka: </span>
                        <span className="font-medium">{appointment.facilityName}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Notatki: </span>
                        {appointment.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 rounded-2xl"
          >
            <X className="w-4 h-4 mr-2" />
            Zamknij
          </Button>
          {onBookNew && (
            <Button
              onClick={handleBookNew}
              className="flex-1 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Umów powtórzenie
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
