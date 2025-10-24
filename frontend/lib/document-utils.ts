import { Document, DocumentGroup } from "@/types/document";

/**
 * Utility functions for document manipulation and grouping
 */

/**
 * Groups documents by month and year, sorted in descending order (newest first)
 */
export function groupDocumentsByMonth(documents: Document[]): DocumentGroup[] {
  // Sort documents by date descending (newest first)
  const sortedDocuments = [...documents].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Group by month-year
  const grouped = new Map<string, Document[]>();

  sortedDocuments.forEach((doc) => {
    const monthYear = formatMonthYear(doc.date);
    const existing = grouped.get(monthYear) || [];
    grouped.set(monthYear, [...existing, doc]);
  });

  // Convert to array of DocumentGroups
  const groups: DocumentGroup[] = [];
  grouped.forEach((docs, monthYear) => {
    const firstDoc = docs[0];
    groups.push({
      monthYear,
      month: firstDoc.date.getMonth(),
      year: firstDoc.date.getFullYear(),
      documents: docs,
    });
  });

  return groups;
}

/**
 * Formats a date into "Month Year" format (e.g., "January 2025")
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Formats a date into a short format (e.g., "Jan 15, 2025")
 */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Gets the appropriate icon color class based on document type
 */
export function getDocumentTypeColor(type: string): {
  bg: string;
  text: string;
  badge: string;
} {
  const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
    "Medical Record": {
      bg: "bg-blue-50",
      text: "text-blue-600",
      badge: "bg-blue-100 text-blue-700 border-blue-200",
    },
    Prescription: {
      bg: "bg-green-50",
      text: "text-green-600",
      badge: "bg-green-100 text-green-700 border-green-200",
    },
    "Lab Result": {
      bg: "bg-purple-50",
      text: "text-purple-600",
      badge: "bg-purple-100 text-purple-700 border-purple-200",
    },
    Vaccination: {
      bg: "bg-pink-50",
      text: "text-pink-600",
      badge: "bg-pink-100 text-pink-700 border-pink-200",
    },
    Imaging: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    },
    Insurance: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      badge: "bg-amber-100 text-amber-700 border-amber-200",
    },
    Referral: {
      bg: "bg-teal-50",
      text: "text-teal-600",
      badge: "bg-teal-100 text-teal-700 border-teal-200",
    },
    Diagnosis: {
      bg: "bg-red-50",
      text: "text-red-600",
      badge: "bg-red-100 text-red-700 border-red-200",
    },
    Other: {
      bg: "bg-gray-50",
      text: "text-gray-600",
      badge: "bg-gray-100 text-gray-700 border-gray-200",
    },
  };

  return (
    colorMap[type] || {
      bg: "bg-gray-50",
      text: "text-gray-600",
      badge: "bg-gray-100 text-gray-700 border-gray-200",
    }
  );
}
