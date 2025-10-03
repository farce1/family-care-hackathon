"use client";

import { Document } from "@/types/document";
import { groupDocumentsByMonth, formatShortDate, getDocumentTypeColor } from "@/lib/document-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Pill,
  FlaskConical,
  Syringe,
  ImageIcon,
  ShieldCheck,
  FileCheck,
  Stethoscope,
  File,
  Download,
  Calendar,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentTimelineProps {
  documents: Document[];
  accentColor?: "orange" | "amber";
}

/**
 * Get the appropriate icon for each document type
 */
function getDocumentIcon(type: string) {
  const iconMap: Record<string, React.ReactNode> = {
    "Medical Record": <Stethoscope className="w-4 h-4" />,
    "Prescription": <Pill className="w-4 h-4" />,
    "Lab Result": <FlaskConical className="w-4 h-4" />,
    "Vaccination": <Syringe className="w-4 h-4" />,
    "Imaging": <ImageIcon className="w-4 h-4" />,
    "Insurance": <ShieldCheck className="w-4 h-4" />,
    "Referral": <FileCheck className="w-4 h-4" />,
    "Diagnosis": <FileText className="w-4 h-4" />,
    "Other": <File className="w-4 h-4" />,
  };

  return iconMap[type] || <File className="w-4 h-4" />;
}

/**
 * DocumentTimeline Component
 * Displays documents in a vertical timeline grouped by month-year
 * Only shows months that have associated documents (sparse timeline)
 */
export function DocumentTimeline({ documents, accentColor = "orange" }: DocumentTimelineProps) {
  const documentGroups = groupDocumentsByMonth(documents);

  if (documentGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-muted/50 rounded-full mb-4">
          <FileText className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No documents yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Start uploading health documents to see them organized in a timeline view.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline vertical line */}
      <div
        className={cn(
          "absolute left-[22px] top-0 bottom-0 w-0.5 -z-0",
          accentColor === "orange"
            ? "bg-gradient-to-b from-orange-400 via-orange-300 to-orange-200"
            : "bg-gradient-to-b from-amber-400 via-amber-300 to-amber-200"
        )}
      />

      <div className="space-y-6">
        {documentGroups.map((group, groupIndex) => (
          <div key={group.monthYear} className="relative">
            {/* Month-Year Label with Timeline Dot */}
            <div className="flex items-center gap-3 mb-3">
              {/* Large Timeline Dot */}
              <div className="relative flex items-center justify-center z-10">
                <div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center shadow-md",
                    accentColor === "orange"
                      ? "bg-gradient-to-br from-orange-400 to-orange-500"
                      : "bg-gradient-to-br from-amber-400 to-amber-500"
                  )}
                >
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                {/* Pulsing ring animation for most recent month */}
                {groupIndex === 0 && (
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full animate-ping opacity-20",
                      accentColor === "orange" ? "bg-orange-400" : "bg-amber-400"
                    )}
                  />
                )}
              </div>

              {/* Month-Year Text */}
              <div>
                <h3
                  className={cn(
                    "text-lg font-bold font-[family-name:var(--font-quicksand)]",
                    accentColor === "orange" ? "text-orange-600" : "text-amber-600"
                  )}
                >
                  {group.monthYear}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {group.documents.length} {group.documents.length === 1 ? "document" : "documents"}
                </p>
              </div>
            </div>

            {/* Documents for this month */}
            <div className="ml-[68px] space-y-3">
              {group.documents.map((doc) => {
                const colors = getDocumentTypeColor(doc.type);

                return (
                  <Card
                    key={doc.id}
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-border bg-white/80 backdrop-blur-sm overflow-hidden"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {/* Document Icon */}
                        <div className={cn("p-2 rounded-lg shrink-0", colors.bg)}>
                          <div className={colors.text}>
                            {getDocumentIcon(doc.type)}
                          </div>
                        </div>

                        {/* Document Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground text-sm mb-1 truncate">
                                {doc.title}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className={cn("text-xs px-1.5 py-0", colors.badge)}
                                >
                                  {doc.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatShortDate(doc.date)}
                                </span>
                              </div>
                            </div>

                            {/* Download Button */}
                            <button
                              className={cn(
                                "p-1.5 rounded-md transition-colors shrink-0",
                                accentColor === "orange"
                                  ? "hover:bg-orange-50 text-orange-600"
                                  : "hover:bg-amber-50 text-amber-600"
                              )}
                              onClick={() => {
                                // Handle download - placeholder for now
                                console.log("Download", doc.id);
                              }}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Description */}
                          {doc.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {doc.description}
                            </p>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {doc.fileSize && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {doc.fileSize}
                              </span>
                            )}
                            {doc.uploadedBy && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {doc.uploadedBy}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
