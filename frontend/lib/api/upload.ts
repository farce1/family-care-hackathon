/**
 * API client for PDF upload and parsing
 */

import { getApiBaseUrl, API_ENDPOINTS } from './config';
import { getStoredToken } from './auth';

/**
 * Response from the /parse-pdf endpoint
 */
export interface ParsePdfResponse {
  id: string;
  name: string;
  date: string;
  appointment_type: string;
  summary: string;
  doctor: string;
  file_size: number;
  confidence_score: number;
}

/**
 * Error response from the backend
 */
export interface UploadError {
  detail: string;
  status?: number;
}

/**
 * Upload a PDF file to be parsed
 * @param file - The PDF file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Parsed appointment data
 */
export async function uploadPdfFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ParsePdfResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${API_ENDPOINTS.PARSE_PDF}`;

  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          reject({
            detail: 'Failed to parse server response',
            status: xhr.status,
          });
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject({
            detail: errorResponse.detail || `Upload failed with status ${xhr.status}`,
            status: xhr.status,
          });
        } catch {
          reject({
            detail: `Upload failed with status ${xhr.status}`,
            status: xhr.status,
          });
        }
      }
    });

    // Handle network errors
    xhr.addEventListener('error', () => {
      reject({
        detail: 'Network error occurred during upload',
        status: 0,
      });
    });

    // Handle timeout
    xhr.addEventListener('timeout', () => {
      reject({
        detail: 'Upload request timed out',
        status: 0,
      });
    });

    // Set timeout to 60 seconds
    xhr.timeout = 60000;

    // Open and send the request
    xhr.open('POST', url);

    // Add authorization header if token exists
    const token = getStoredToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.send(formData);
  });
}
