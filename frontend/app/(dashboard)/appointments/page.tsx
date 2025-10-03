import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TextAnimate } from "@/components/ui/text-animate"
import { BookAppointmentDialog } from "@/components/book-appointment-dialog"
import { Calendar, Clock, MapPin, User, FileText, CheckCircle2, XCircle, Bell } from "lucide-react"
import { getUpcomingAppointments, getArchivalAppointments, familyMembers, currentUser } from "@/lib/mock-data"
import { format } from "date-fns"
import { Appointment } from "@/types/appointment"

export default function AppointmentsPage() {
  const upcomingAppointments = getUpcomingAppointments()
  const archivalAppointments = getArchivalAppointments()

  // Helper function to get family member info
  const getFamilyMemberInfo = (memberId: string) => {
    if (memberId === "current") return currentUser
    return familyMembers.find((member) => member.id === memberId)
  }

  // Helper function to get status badge
  const getStatusBadge = (status: Appointment["status"]) => {
    const statusConfig = {
      upcoming: { label: "Upcoming", className: "bg-blue-100 text-blue-700 border-blue-200" },
      completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
      rescheduled: { label: "Rescheduled", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      "no-show": { label: "No Show", className: "bg-gray-100 text-gray-700 border-gray-200" },
    }

    const config = statusConfig[status]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  // Helper function to render appointment card
  const renderAppointmentCard = (appointment: Appointment, index: number) => {
    const memberInfo = getFamilyMemberInfo(appointment.familyMemberId)
    const accentColor = appointment.accentColor || memberInfo?.accentColor || "orange"

    return (
      <Card
        key={appointment.id}
        className="group hover:shadow-lg transition-all duration-300 border-border bg-white/80 backdrop-blur-sm overflow-hidden relative"
        style={{
          animationDelay: `${index * 50}ms`,
        }}
      >
        {/* Accent line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            accentColor === "orange"
              ? "from-primary to-primary/80"
              : "from-secondary to-secondary/80"
          }`}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {memberInfo && (
                <Avatar className="w-12 h-12 ring-2 ring-primary/10">
                  <AvatarImage src={memberInfo.avatar} alt={memberInfo.name} />
                  <AvatarFallback
                    className={`text-sm font-bold ${
                      accentColor === "orange"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    {memberInfo.initials}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {appointment.familyMemberName}
                </h3>
                <p className="text-sm text-muted-foreground">{appointment.appointmentType}</p>
              </div>
            </div>
            {getStatusBadge(appointment.status)}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Date and Time */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg ${
              accentColor === "orange" ? "bg-primary/5" : "bg-secondary/5"
            }`}
          >
            <div
              className={`p-2 rounded-md ${
                accentColor === "orange" ? "bg-primary/10" : "bg-secondary/10"
              }`}
            >
              <Calendar
                className={`w-4 h-4 ${
                  accentColor === "orange" ? "text-primary" : "text-secondary"
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Date & Time</p>
              <p
                className={`font-semibold ${
                  accentColor === "orange" ? "text-primary" : "text-secondary"
                }`}
              >
                {format(appointment.dateTime, "PPP 'at' p")}
              </p>
            </div>
            {appointment.reminder && appointment.status === "upcoming" && (
              <Bell className="w-4 h-4 text-primary" />
            )}
          </div>

          {/* Facility */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg ${
              accentColor === "orange" ? "bg-primary/5" : "bg-secondary/5"
            }`}
          >
            <div
              className={`p-2 rounded-md ${
                accentColor === "orange" ? "bg-primary/10" : "bg-secondary/10"
              }`}
            >
              <MapPin
                className={`w-4 h-4 ${
                  accentColor === "orange" ? "text-primary" : "text-secondary"
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Facility</p>
              <p
                className={`font-semibold text-sm ${
                  accentColor === "orange" ? "text-primary" : "text-secondary"
                }`}
              >
                {appointment.facilityName}
              </p>
              {appointment.facilityAddress && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {appointment.facilityAddress}
                </p>
              )}
            </div>
          </div>

          {/* Doctor */}
          {appointment.doctorName && (
            <div
              className={`flex items-center gap-3 p-3 rounded-lg ${
                accentColor === "orange" ? "bg-primary/5" : "bg-secondary/5"
              }`}
            >
              <div
                className={`p-2 rounded-md ${
                  accentColor === "orange" ? "bg-primary/10" : "bg-secondary/10"
                }`}
              >
                <User
                  className={`w-4 h-4 ${
                    accentColor === "orange" ? "text-primary" : "text-secondary"
                  }`}
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Doctor</p>
                <p
                  className={`font-semibold ${
                    accentColor === "orange" ? "text-primary" : "text-secondary"
                  }`}
                >
                  {appointment.doctorName}
                </p>
              </div>
              {appointment.duration && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{appointment.duration} min</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div
              className={`flex items-start gap-3 p-3 rounded-lg ${
                accentColor === "orange" ? "bg-primary/5" : "bg-secondary/5"
              }`}
            >
              <div
                className={`p-2 rounded-md ${
                  accentColor === "orange" ? "bg-primary/10" : "bg-secondary/10"
                }`}
              >
                <FileText
                  className={`w-4 h-4 ${
                    accentColor === "orange" ? "text-primary" : "text-secondary"
                  }`}
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm text-foreground mt-1">{appointment.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <TextAnimate
              animation="blurIn"
              by="word"
              className="text-4xl font-bold text-primary mb-2 font-[family-name:var(--font-quicksand)]"
            >
              Appointments
            </TextAnimate>
            <p className="text-secondary text-lg">
              Manage your family&apos;s medical appointments
            </p>
          </div>
          <BookAppointmentDialog />
        </div>

        {/* Upcoming Appointments Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-quicksand)]">
                Upcoming Appointments
              </h2>
              <p className="text-sm text-muted-foreground">
                {upcomingAppointments.length} appointment{upcomingAppointments.length !== 1 ? "s" : ""} scheduled
              </p>
            </div>
          </div>

          {upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingAppointments.map((appointment, index) =>
                renderAppointmentCard(appointment, index)
              )}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-border bg-white/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-muted-foreground mb-2">
                  No upcoming appointments
                </p>
                <p className="text-sm text-muted-foreground">
                  Book a new appointment to get started
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Archival Appointments Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gray-100">
              <CheckCircle2 className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground font-[family-name:var(--font-quicksand)]">
                Appointment History
              </h2>
              <p className="text-sm text-muted-foreground">
                Past and cancelled appointments
              </p>
            </div>
          </div>

          {archivalAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archivalAppointments.map((appointment, index) =>
                renderAppointmentCard(appointment, index)
              )}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-border bg-white/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <XCircle className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">
                  No appointment history
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
