"use client";

import { DocumentTimeline } from "@/components/document-timeline";
import { UploadMedicalRecordDialog } from "@/components/upload-medical-record-dialog";
import { currentUser } from "@/lib/mock-data";
import { useParsedAppointments } from "@/lib/hooks/use-parsed-appointments";
import { Heart, FileText, Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  // Fetch parsed appointments from backend
  const { data: documents, isLoading, isError, error } = useParsedAppointments();

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-background/90 overflow-hidden">
      <div className="p-4 max-w-7xl mx-auto h-full flex flex-col">
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
                  Here&apos;s an overview of your health records
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UploadMedicalRecordDialog />
            </div>
          </div>
        </div>

        {/* Health Records Section */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading health records...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3 max-w-md text-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="text-sm font-medium text-red-700">Failed to load health records</p>
                <p className="text-xs text-muted-foreground">
                  {error instanceof Error ? error.message : "An unknown error occurred"}
                </p>
              </div>
            </div>
          ) : documents && documents.length > 0 ? (
            <DocumentTimeline documents={documents} accentColor="orange" />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <FileText className="w-12 h-12 text-orange-300" />
                <p className="text-sm text-muted-foreground">No health records found</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
