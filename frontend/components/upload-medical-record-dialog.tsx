"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadPdfFile, type UploadError } from "@/lib/api/upload";

// File validation schema
const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type === "application/pdf", {
      message: "Only PDF files are allowed",
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File size must be less than 10MB",
    }),
});

// File upload status
type FileStatus = "pending" | "uploading" | "success" | "error";

interface FileWithStatus {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
  retryCount?: number;
}

const MAX_RETRY_ATTEMPTS = 3;

export function UploadMedicalRecordDialog() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Upload mutation with automatic retry on error
  const uploadMutation = useMutation({
    mutationFn: async ({ file, id }: { file: File; id: string }) => {
      return uploadPdfFile(file, (progress) => {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress, status: "uploading" as FileStatus } : f))
        );
      });
    },
    onSuccess: (data, variables) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === variables.id ? { ...f, status: "success" as FileStatus, progress: 100 } : f
        )
      );
      // Invalidate the parsed appointments query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["parsed-appointments"] });
    },
    onError: (error: UploadError, variables) => {
      const errorMessage = error.detail || "Upload failed";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === variables.id
            ? {
                ...f,
                status: "error" as FileStatus,
                error: errorMessage,
              }
            : f
        )
      );
    },
  });

  const handleFileSelection = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileWithStatus[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      const validation = fileSchema.safeParse({ file });
      if (validation.success) {
        newFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          status: "pending",
          progress: 0,
          retryCount: 0,
        });
      } else {
        errors.push(`${file.name}: ${validation.error.errors[0].message}`);
      }
    });

    if (errors.length > 0) {
      alert(`Some files were not added:\n${errors.join("\n")}`);
    }

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelection(e.dataTransfer.files);
    },
    [handleFileSelection]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelection(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [handleFileSelection]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const retryFile = useCallback(
    async (id: string) => {
      const fileItem = files.find((f) => f.id === id);
      if (!fileItem) return;

      const currentRetryCount = fileItem.retryCount || 0;
      if (currentRetryCount >= MAX_RETRY_ATTEMPTS) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  ...f,
                  error: `Maximum retry attempts (${MAX_RETRY_ATTEMPTS}) reached`,
                }
              : f
          )
        );
        return;
      }

      // Reset file status and increment retry count
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "pending" as FileStatus,
                progress: 0,
                error: undefined,
                retryCount: currentRetryCount + 1,
              }
            : f
        )
      );

      // Retry upload
      try {
        await uploadMutation.mutateAsync({ file: fileItem.file, id: fileItem.id });
      } catch {
        // Error handled by mutation onError
      }
    },
    [files, uploadMutation]
  );

  const handleUpload = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");

    // Upload all pending files with individual error handling
    await Promise.allSettled(
      pendingFiles.map((fileItem) =>
        uploadMutation.mutateAsync({ file: fileItem.file, id: fileItem.id })
      )
    );
  }, [files, uploadMutation]);

  const handleClose = useCallback(() => {
    // Only allow closing if no files are uploading
    const hasUploading = files.some((f) => f.status === "uploading");
    if (!hasUploading) {
      setOpen(false);
      // Clear files after a short delay to allow animation
      setTimeout(() => setFiles([]), 300);
    }
  }, [files]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case "pending":
        return <FileText className="w-5 h-5 text-orange-600" />;
      case "uploading":
        return <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const retryableErrorCount = files.filter(
    (f) => f.status === "error" && (f.retryCount || 0) < MAX_RETRY_ATTEMPTS
  ).length;

  const handleRetryAll = useCallback(async () => {
    const failedFiles = files.filter(
      (f) => f.status === "error" && (f.retryCount || 0) < MAX_RETRY_ATTEMPTS
    );

    for (const fileItem of failedFiles) {
      await retryFile(fileItem.id);
    }
  }, [files, retryFile]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ShimmerButton
          shimmerColor="#ffffff"
          shimmerSize="0.1em"
          borderRadius="0.75rem"
          shimmerDuration="2s"
          background="linear-gradient(to right, oklch(0.64 0.08 245), oklch(0.70 0.08 245))"
          className="flex items-center gap-2 px-6 py-3 text-base font-semibold h-12"
        >
          <Upload className="w-5 h-5" />
          Upload Records
        </ShimmerButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary font-[family-name:var(--font-quicksand)]">
            Upload Medical Records
          </DialogTitle>
          <DialogDescription>
            Upload PDF files of your medical records. You can select multiple files at once.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 mt-4">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200",
              isDragOver
                ? "border-orange-500 bg-orange-50"
                : "border-border bg-orange-50/30 hover:bg-orange-50/50"
            )}
          >
            {isDragOver && (
              <BorderBeam size={100} duration={3} colorFrom="#fb923c" colorTo="#f97316" />
            )}

            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="p-4 bg-orange-100 rounded-full">
                <Upload className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground mb-1">
                  Drag & drop PDF files here
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  or click to browse (max 10MB per file)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-orange-50 border-orange-200 text-orange-700 rounded-xl"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Select Files
                </Button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Selected Files ({files.length})
                </h3>
                {successCount > 0 && (
                  <span className="text-xs text-green-600 font-medium">
                    {successCount} uploaded successfully
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {files.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className={cn(
                      "relative p-4 bg-white border rounded-xl transition-all",
                      fileItem.status === "success" && "border-green-200 bg-green-50/30",
                      fileItem.status === "error" && "border-red-200 bg-red-50/30",
                      fileItem.status === "uploading" && "border-orange-200 bg-orange-50/30",
                      fileItem.status === "pending" && "border-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{getStatusIcon(fileItem.status)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {fileItem.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatFileSize(fileItem.file.size)}
                            </p>
                          </div>

                          {fileItem.status !== "uploading" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeFile(fileItem.id)}
                              className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {fileItem.status === "uploading" && (
                          <div className="mt-2 space-y-1">
                            <Progress value={fileItem.progress} className="h-1.5" />
                            <p className="text-xs text-muted-foreground">
                              Uploading... {Math.round(fileItem.progress)}%
                            </p>
                          </div>
                        )}

                        {/* Error Message with Retry Button */}
                        {fileItem.status === "error" && (
                          <div className="mt-2 space-y-2">
                            {fileItem.error && (
                              <p className="text-xs text-red-600">{fileItem.error}</p>
                            )}
                            {(fileItem.retryCount || 0) < MAX_RETRY_ATTEMPTS && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => retryFile(fileItem.id)}
                                className="h-7 text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
                              >
                                <RotateCw className="w-3 h-3 mr-1" />
                                Retry Upload
                                {(fileItem.retryCount || 0) > 0 && (
                                  <span className="ml-1 text-muted-foreground">
                                    ({fileItem.retryCount}/{MAX_RETRY_ATTEMPTS})
                                  </span>
                                )}
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Success Message */}
                        {fileItem.status === "success" && (
                          <p className="text-xs text-green-600 mt-2 font-medium">Upload complete</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {uploadingCount > 0 && (
              <span className="text-orange-600 font-medium">
                Uploading {uploadingCount} file{uploadingCount !== 1 ? "s" : ""}...
              </span>
            )}
            {errorCount > 0 && uploadingCount === 0 && (
              <span className="text-red-600 font-medium">
                {errorCount} file{errorCount !== 1 ? "s" : ""} failed
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploadingCount > 0}
              className="rounded-xl"
            >
              {successCount > 0 && pendingCount === 0 && uploadingCount === 0 ? "Close" : "Cancel"}
            </Button>

            {retryableErrorCount > 0 && uploadingCount === 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRetryAll}
                className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Retry Failed ({retryableErrorCount})
              </Button>
            )}

            {pendingCount > 0 && (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={uploadingCount > 0}
                className="rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white"
              >
                {uploadingCount > 0 ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {pendingCount} File{pendingCount !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
