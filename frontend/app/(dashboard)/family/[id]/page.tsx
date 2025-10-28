import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentTimeline } from "@/components/document-timeline";
import { UploadMedicalRecordDialog } from "@/components/upload-medical-record-dialog";
import { getFamilyMember, getDocumentsForMember } from "@/lib/mock-data";
import { Heart, Calendar, Droplet, AlertCircle, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

interface FamilyMemberPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Single Person View Page
 * Displays family member details and their health records timeline
 */
export default async function FamilyMemberPage({ params }: FamilyMemberPageProps) {
  const resolvedParams = await params;
  const member = getFamilyMember(resolvedParams.id);

  if (!member) {
    notFound();
  }

  const documents = getDocumentsForMember(resolvedParams.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 overflow-hidden">
      <div className="p-4 max-w-7xl mx-auto">
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

        {/* Health Records Section */}
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
      </div>
    </div>
  );
}

/**
 * Generate static params for all family members
 * This enables static generation at build time
 */
export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }];
}
