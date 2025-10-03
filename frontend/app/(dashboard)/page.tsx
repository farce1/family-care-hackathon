import { Particles } from "@/components/ui/particles";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentTimeline } from "@/components/document-timeline";
import { BookAppointmentDialog } from "@/components/book-appointment-dialog";
import { UploadMedicalRecordDialog } from "@/components/upload-medical-record-dialog";
import {
  currentUser,
  currentUserDocuments,
  getUpcomingAppointments,
  getArchivalAppointments,
} from "@/lib/mock-data";
import {
  Heart,
  Calendar,
  FileText,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// Format date for display
function formatAppointmentDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format time for display
function formatAppointmentTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Get status badge styling and icon
function getStatusDisplay(status: string) {
  switch (status) {
    case "upcoming":
      return {
        className: "bg-orange-100 text-orange-700 border-orange-200",
        icon: <Clock className="w-3 h-3" />,
        label: "Upcoming",
      };
    case "completed":
      return {
        className: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: "Completed",
      };
    case "cancelled":
      return {
        className: "bg-gray-100 text-gray-700 border-gray-200",
        icon: <XCircle className="w-3 h-3" />,
        label: "Cancelled",
      };
    default:
      return {
        className: "bg-orange-100 text-orange-700 border-orange-200",
        icon: <Clock className="w-3 h-3" />,
        label: status,
      };
  }
}

export default function Home() {
  const documentCount = currentUserDocuments.length;
  const upcomingAppointments = getUpcomingAppointments();
  const archivalAppointments = getArchivalAppointments();

  return (
    <div className="relative h-screen bg-gradient-to-br from-background via-background to-background/90 overflow-hidden">
      <Particles
        className="absolute inset-0"
        quantity={60}
        ease={70}
        color="oklch(0.64 0.08 245)"
        refresh={false}
      />

      <div className="relative z-10 p-4 max-w-7xl mx-auto h-full flex flex-col">
        {/* Welcome Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-primary fill-primary animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-primary font-[family-name:var(--font-quicksand)]">
                  Welcome Back, {currentUser.name.split(" ")[0]}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Here&apos;s an overview of your health records and appointments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookAppointmentDialog />
              <UploadMedicalRecordDialog />
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="records" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-4 bg-orange-50 flex-shrink-0">
            <TabsTrigger
              value="records"
              className="data-[state=active]:bg-orange-400 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Health Records
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="data-[state=active]:bg-orange-400 data-[state=active]:text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
          </TabsList>

          {/* Health Records Tab */}
          <TabsContent value="records" className="mt-0 flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-50">
              <DocumentTimeline documents={currentUserDocuments} accentColor="orange" />
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="mt-0 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-50">
            {/* Upcoming Appointments */}
            <div className="mb-6">
              <div className="mb-3">
                <h2 className="text-xl font-bold text-orange-600 mb-1 font-[family-name:var(--font-quicksand)]">
                  Upcoming Appointments
                </h2>
                <p className="text-muted-foreground text-sm">
                  {upcomingAppointments.length} scheduled appointment
                  {upcomingAppointments.length !== 1 ? "s" : ""}
                </p>
              </div>

              <Card className="bg-white/80 backdrop-blur-sm border-border overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-500" />
                <CardContent className="p-0">
                  {upcomingAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-orange-50/50">
                            <TableHead className="font-semibold text-orange-900">Date</TableHead>
                            <TableHead className="font-semibold text-orange-900">Time</TableHead>
                            <TableHead className="font-semibold text-orange-900">
                              Doctor/Provider
                            </TableHead>
                            <TableHead className="font-semibold text-orange-900">Type</TableHead>
                            <TableHead className="font-semibold text-orange-900">
                              Location
                            </TableHead>
                            <TableHead className="font-semibold text-orange-900">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingAppointments.map((appointment) => {
                            const statusDisplay = getStatusDisplay(appointment.status);
                            return (
                              <TableRow
                                key={appointment.id}
                                className="hover:bg-orange-50/30 transition-colors"
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-orange-600" />
                                    {formatAppointmentDate(appointment.dateTime)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                    {formatAppointmentTime(appointment.dateTime)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-orange-600" />
                                    <div>
                                      <div className="font-medium">{appointment.doctorName}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {appointment.facilityName}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-100 text-amber-700 border-amber-200"
                                  >
                                    {appointment.appointmentType}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {appointment.facilityAddress && (
                                    <div className="flex items-start gap-2 max-w-xs">
                                      <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-muted-foreground">
                                        {appointment.facilityAddress}
                                      </span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className={statusDisplay.className}>
                                    <span className="flex items-center gap-1">
                                      {statusDisplay.icon}
                                      {statusDisplay.label}
                                    </span>
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      No upcoming appointments scheduled
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Appointment History */}
            <div>
              <div className="mb-3">
                <h2 className="text-xl font-bold text-orange-600 mb-1 font-[family-name:var(--font-quicksand)]">
                  Appointment History
                </h2>
                <p className="text-muted-foreground text-sm">
                  Past and completed appointments
                </p>
              </div>

              <Card className="bg-white/80 backdrop-blur-sm border-border overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-500" />
                <CardContent className="p-0">
                  {archivalAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-orange-50/50">
                            <TableHead className="font-semibold text-orange-900">Date</TableHead>
                            <TableHead className="font-semibold text-orange-900">Time</TableHead>
                            <TableHead className="font-semibold text-orange-900">
                              Doctor/Provider
                            </TableHead>
                            <TableHead className="font-semibold text-orange-900">Type</TableHead>
                            <TableHead className="font-semibold text-orange-900">
                              Location
                            </TableHead>
                            <TableHead className="font-semibold text-orange-900">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {archivalAppointments.map((appointment) => {
                            const statusDisplay = getStatusDisplay(appointment.status);
                            return (
                              <TableRow
                                key={appointment.id}
                                className="hover:bg-orange-50/30 transition-colors"
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-orange-600" />
                                    {formatAppointmentDate(appointment.dateTime)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                    {formatAppointmentTime(appointment.dateTime)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-orange-600" />
                                    <div>
                                      <div className="font-medium">{appointment.doctorName}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {appointment.facilityName}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-100 text-amber-700 border-amber-200"
                                  >
                                    {appointment.appointmentType}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {appointment.facilityAddress && (
                                    <div className="flex items-start gap-2 max-w-xs">
                                      <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-muted-foreground">
                                        {appointment.facilityAddress}
                                      </span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className={statusDisplay.className}>
                                    <span className="flex items-center gap-1">
                                      {statusDisplay.icon}
                                      {statusDisplay.label}
                                    </span>
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      No appointment history available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
