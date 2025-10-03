import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Particles } from "@/components/ui/particles";
import { BookAppointmentDialog } from "@/components/book-appointment-dialog";
import { UploadMedicalRecordDialog } from "@/components/upload-medical-record-dialog";
import {
  getFamilyMember,
  getDocumentsForMember,
  getAppointmentsForMember,
} from "@/lib/mock-data";
import {
  Heart,
  Calendar,
  Droplet,
  AlertCircle,
  ArrowLeft,
  Clock,
  MapPin,
  FileText,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

interface FamilyMemberPageProps {
  params: Promise<{
    id: string;
  }>;
}

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

/**
 * Single Person View Page
 * Displays family member details and their document timeline
 */
export default async function FamilyMemberPage({ params }: FamilyMemberPageProps) {
  const resolvedParams = await params;
  const member = getFamilyMember(resolvedParams.id);

  if (!member) {
    notFound();
  }

  const documents = getDocumentsForMember(resolvedParams.id);
  const appointments = getAppointmentsForMember(resolvedParams.id);

  // Split appointments into upcoming and history
  const upcomingAppointments = appointments.filter((apt) => apt.status === "upcoming");
  const archivalAppointments = appointments.filter(
    (apt) => apt.status === "completed" || apt.status === "cancelled"
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background/90 overflow-hidden">
      <Particles
        className="absolute inset-0"
        quantity={60}
        ease={70}
        color={member.accentColor === "orange" ? "oklch(0.64 0.08 245)" : "oklch(0.76 0.09 77)"}
        refresh={false}
      />

      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header with Back Button and Action Buttons */}
        <div className="flex items-center justify-between mb-3">
          <Link
            href="/family"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Family Members
          </Link>
          <div className="flex items-center gap-3">
            <BookAppointmentDialog />
            <UploadMedicalRecordDialog />
          </div>
        </div>

        {/* Member Header Card */}
        <Card className="mb-4 bg-white/80 backdrop-blur-sm border-border overflow-hidden">
          {/* Decorative accent line */}
          <div
            className={`h-2 ${
              member.accentColor === "orange"
                ? "bg-gradient-to-r from-orange-400 to-orange-500"
                : "bg-gradient-to-r from-amber-400 to-amber-500"
            }`}
          />

          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <Avatar className="w-20 h-20 ring-2 ring-primary/20">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback
                    className={`text-xl font-bold ${
                      member.accentColor === "orange"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Member Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1 font-[family-name:var(--font-quicksand)]">
                      {member.name}
                    </h1>
                    <Badge
                      variant="secondary"
                      className={`${
                        member.accentColor === "orange"
                          ? "bg-orange-100 text-orange-700 border-orange-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }`}
                    >
                      {member.role}
                    </Badge>
                  </div>

                  <Heart
                    className={`w-6 h-6 ${
                      member.accentColor === "orange" ? "text-orange-500" : "text-amber-500"
                    } fill-current`}
                  />
                </div>

                {/* Health Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                  {member.dateOfBirth && (
                    <div
                      className={`p-2.5 rounded-lg ${
                        member.accentColor === "orange" ? "bg-orange-50" : "bg-amber-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Calendar
                          className={`w-3.5 h-3.5 ${
                            member.accentColor === "orange" ? "text-orange-600" : "text-amber-600"
                          }`}
                        />
                        <span className="text-xs text-muted-foreground">Date of Birth</span>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          member.accentColor === "orange" ? "text-orange-700" : "text-amber-700"
                        }`}
                      >
                        {new Date(member.dateOfBirth).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}

                  {member.bloodType && (
                    <div
                      className={`p-2.5 rounded-lg ${
                        member.accentColor === "orange" ? "bg-orange-50" : "bg-amber-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Droplet
                          className={`w-3.5 h-3.5 ${
                            member.accentColor === "orange" ? "text-orange-600" : "text-amber-600"
                          }`}
                        />
                        <span className="text-xs text-muted-foreground">Blood Type</span>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          member.accentColor === "orange" ? "text-orange-700" : "text-amber-700"
                        }`}
                      >
                        {member.bloodType}
                      </p>
                    </div>
                  )}

                  {member.allergies && member.allergies.length > 0 && (
                    <div
                      className={`p-2.5 rounded-lg ${
                        member.accentColor === "orange" ? "bg-orange-50" : "bg-amber-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <AlertCircle
                          className={`w-3.5 h-3.5 ${
                            member.accentColor === "orange" ? "text-orange-600" : "text-amber-600"
                          }`}
                        />
                        <span className="text-xs text-muted-foreground">Allergies</span>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          member.accentColor === "orange" ? "text-orange-700" : "text-amber-700"
                        }`}
                      >
                        {member.allergies.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="records" className="w-full">
          <TabsList
            className={`grid w-full max-w-md grid-cols-2 mb-3 ${
              member.accentColor === "orange" ? "bg-orange-50" : "bg-amber-50"
            }`}
          >
            <TabsTrigger
              value="records"
              className={`${
                member.accentColor === "orange"
                  ? "data-[state=active]:bg-orange-400 data-[state=active]:text-white"
                  : "data-[state=active]:bg-amber-400 data-[state=active]:text-white"
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Health Records
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className={`${
                member.accentColor === "orange"
                  ? "data-[state=active]:bg-orange-400 data-[state=active]:text-white"
                  : "data-[state=active]:bg-amber-400 data-[state=active]:text-white"
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
          </TabsList>

          {/* Health Records Tab Content */}
          <TabsContent value="records" className="mt-0">
            <div className="mb-3">
              <h2
                className={`text-xl font-bold mb-1 font-[family-name:var(--font-quicksand)] ${
                  member.accentColor === "orange" ? "text-orange-600" : "text-amber-600"
                }`}
              >
                {member.name}&apos;s Health Records Timeline
              </h2>
              <p className="text-sm text-muted-foreground">
                Complete medical history organized by date
              </p>
            </div>

            <DocumentTimeline documents={documents} accentColor={member.accentColor} />
          </TabsContent>

          {/* Appointments Tab Content */}
          <TabsContent value="appointments" className="mt-0">
            {/* Upcoming Appointments */}
            <div className="mb-4">
              <div className="mb-3">
                <h2
                  className={`text-xl font-bold mb-1 font-[family-name:var(--font-quicksand)] ${
                    member.accentColor === "orange" ? "text-orange-600" : "text-amber-600"
                  }`}
                >
                  Upcoming Appointments
                </h2>
                <p className="text-sm text-muted-foreground">
                  {upcomingAppointments.length} scheduled appointment
                  {upcomingAppointments.length !== 1 ? "s" : ""}
                </p>
              </div>

              <Card className="bg-white/80 backdrop-blur-sm border-border overflow-hidden">
                <div
                  className={`h-2 ${
                    member.accentColor === "orange"
                      ? "bg-gradient-to-r from-orange-400 to-orange-500"
                      : "bg-gradient-to-r from-amber-400 to-amber-500"
                  }`}
                />
                <CardContent className="p-0">
                  {upcomingAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow
                            className={`${
                              member.accentColor === "orange" ? "bg-orange-50/50" : "bg-amber-50/50"
                            }`}
                          >
                            <TableHead
                              className={`font-semibold ${
                                member.accentColor === "orange" ? "text-orange-900" : "text-amber-900"
                              }`}
                            >
                              Date
                            </TableHead>
                            <TableHead
                              className={`font-semibold ${
                                member.accentColor === "orange" ? "text-orange-900" : "text-amber-900"
                              }`}
                            >
                              Time
                            </TableHead>
                            <TableHead
                              className={`font-semibold ${
                                member.accentColor === "orange" ? "text-orange-900" : "text-amber-900"
                              }`}
                            >
                              Doctor/Provider
                            </TableHead>
                            <TableHead
                              className={`font-semibold ${
                                member.accentColor === "orange" ? "text-orange-900" : "text-amber-900"
                              }`}
                            >
                              Type
                            </TableHead>
                            <TableHead
                              className={`font-semibold ${
                                member.accentColor === "orange" ? "text-orange-900" : "text-amber-900"
                              }`}
                            >
                              Location
                            </TableHead>
                            <TableHead
                              className={`font-semibold ${
                                member.accentColor === "orange" ? "text-orange-900" : "text-amber-900"
                              }`}
                            >
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingAppointments.map((appointment) => {
                            const statusDisplay = getStatusDisplay(appointment.status);
                            return (
                              <TableRow
                                key={appointment.id}
                                className={`${
                                  member.accentColor === "orange"
                                    ? "hover:bg-orange-50/30"
                                    : "hover:bg-amber-50/30"
                                } transition-colors`}
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Calendar
                                      className={`w-4 h-4 ${
                                        member.accentColor === "orange"
                                          ? "text-orange-600"
                                          : "text-amber-600"
                                      }`}
                                    />
                                    {formatAppointmentDate(appointment.dateTime)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Clock
                                      className={`w-4 h-4 ${
                                        member.accentColor === "orange"
                                          ? "text-orange-600"
                                          : "text-amber-600"
                                      }`}
                                    />
                                    {formatAppointmentTime(appointment.dateTime)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User
                                      className={`w-4 h-4 ${
                                        member.accentColor === "orange"
                                          ? "text-orange-600"
                                          : "text-amber-600"
                                      }`}
                                    />
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
                                    className={`${
                                      member.accentColor === "orange"
                                        ? "bg-amber-100 text-amber-700 border-amber-200"
                                        : "bg-orange-100 text-orange-700 border-orange-200"
                                    }`}
                                  >
                                    {appointment.appointmentType}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {appointment.facilityAddress && (
                                    <div className="flex items-start gap-2 max-w-xs">
                                      <MapPin
                                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                          member.accentColor === "orange"
                                            ? "text-orange-600"
                                            : "text-amber-600"
                                        }`}
                                      />
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
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No upcoming appointments scheduled
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Appointment History */}
            <div>
              <div className="mb-3">
                <h2
                  className={`text-xl font-bold mb-1 font-[family-name:var(--font-quicksand)] ${
                    member.accentColor === "orange" ? "text-orange-600" : "text-amber-600"
                  }`}
                >
                  Appointment History
                </h2>
                <p className="text-sm text-muted-foreground">Past and completed appointments</p>
              </div>

              <Card className="bg-white/80 backdrop-blur-sm border-border overflow-hidden">
                <div
                  className={`h-2 ${
                    member.accentColor === "orange"
                      ? "bg-gradient-to-r from-orange-400 to-orange-500"
                      : "bg-gradient-to-r from-amber-400 to-amber-500"
                  }`}
                />
                <CardContent className="p-0">
                  {archivalAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow
                            className={`${
                              member.accentColor === "orange" ? "bg-orange-50/50" : "bg-amber-50/50"
                            }`}
                          >
                            <TableHead
                              className={`font-semibold ${
                                member.accentColor === "orange" ? "text-orange-900" : "text-amber-900"
                              }`}
                            >
                              Date
                            </TableHead>
                            <TableHead
                              className={`font-semibold ${
                                member.accentColor === "orange" ? "text-orange-900" : "text-amber-900"
                              }`}
                            >
                              Time
                            </TableHead>
                            <TableHead
                              className={`font-semibold ${
                                member.accentColor === "orange" ? "text-orange-900" : "text-amber-900"
                              }`}
                            >
                              Doctor/Provider
                            </TableHead>
                            <TableHead
                              className={`font-semibold ${
                                member.accentColor === "orange" ? "text-orange-900" : "text-amber-900"
                              }`}
                            >
                              Type
                            </TableHead>
                            <TableHead
                              className={`font-semibold ${
                                member.accentColor === "orange" ? "text-orange-900" : "text-amber-900"
                              }`}
                            >
                              Location
                            </TableHead>
                            <TableHead
                              className={`font-semibold ${
                                member.accentColor === "orange" ? "text-orange-900" : "text-amber-900"
                              }`}
                            >
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {archivalAppointments.map((appointment) => {
                            const statusDisplay = getStatusDisplay(appointment.status);
                            return (
                              <TableRow
                                key={appointment.id}
                                className={`${
                                  member.accentColor === "orange"
                                    ? "hover:bg-orange-50/30"
                                    : "hover:bg-amber-50/30"
                                } transition-colors`}
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Calendar
                                      className={`w-4 h-4 ${
                                        member.accentColor === "orange"
                                          ? "text-orange-600"
                                          : "text-amber-600"
                                      }`}
                                    />
                                    {formatAppointmentDate(appointment.dateTime)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Clock
                                      className={`w-4 h-4 ${
                                        member.accentColor === "orange"
                                          ? "text-orange-600"
                                          : "text-amber-600"
                                      }`}
                                    />
                                    {formatAppointmentTime(appointment.dateTime)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User
                                      className={`w-4 h-4 ${
                                        member.accentColor === "orange"
                                          ? "text-orange-600"
                                          : "text-amber-600"
                                      }`}
                                    />
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
                                    className={`${
                                      member.accentColor === "orange"
                                        ? "bg-amber-100 text-amber-700 border-amber-200"
                                        : "bg-orange-100 text-orange-700 border-orange-200"
                                    }`}
                                  >
                                    {appointment.appointmentType}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {appointment.facilityAddress && (
                                    <div className="flex items-start gap-2 max-w-xs">
                                      <MapPin
                                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                          member.accentColor === "orange"
                                            ? "text-orange-600"
                                            : "text-amber-600"
                                        }`}
                                      />
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
                    <div className="p-4 text-center text-sm text-muted-foreground">
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

/**
 * Generate static params for all family members
 * This enables static generation at build time
 */
export function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
  ];
}
