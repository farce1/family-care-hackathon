"use client";

import { useState } from "react";
import { Document } from "@/types/document";
import { groupDocumentsByMonth, formatShortDate, getDocumentTypeColor } from "@/lib/document-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

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
                const colors = getDocumentTypeColor(doc.appointment_type);

                return (
                  <Card
                    key={doc.id}
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-border bg-white/80 backdrop-blur-sm overflow-hidden cursor-pointer"
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {/* Document Icon */}
                        <div className={cn("p-2 rounded-lg shrink-0", colors.bg)}>
                          <div className={colors.text}>
                            {getDocumentIcon(doc.appointment_type)}
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
                                  {doc.appointment_type}
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
                              onClick={(e) => {
                                e.stopPropagation();
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

      {/* Document Details Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedDocument && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 mb-2">
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    getDocumentTypeColor(selectedDocument.appointment_type).bg
                  )}>
                    <div className={getDocumentTypeColor(selectedDocument.appointment_type).text}>
                      {getDocumentIcon(selectedDocument.appointment_type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-xl mb-2">{selectedDocument.title}</DialogTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          getDocumentTypeColor(selectedDocument.appointment_type).badge
                        )}
                      >
                        {selectedDocument.appointment_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatShortDate(selectedDocument.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Full Description */}
                {selectedDocument.description && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Summary</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedDocument.description}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3 text-foreground">Document Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedDocument.fileSize && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">File Size</p>
                          <p className="font-medium">{selectedDocument.fileSize}</p>
                        </div>
                      </div>
                    )}
                    {selectedDocument.uploadedBy && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Uploaded By</p>
                          <p className="font-medium">{selectedDocument.uploadedBy}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Download Button */}
                {selectedDocument.fileUrl && (
                  <div className="border-t pt-4">
                    <button
                      className={cn(
                        "w-full py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2",
                        accentColor === "orange"
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "bg-amber-500 hover:bg-amber-600 text-white"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Download", selectedDocument.id);
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Download Document
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
