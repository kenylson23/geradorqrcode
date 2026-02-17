import { useState, useCallback } from "react";
import type { UppyFile } from "@uppy/core";

interface UploadMetadata {
  name: string;
  size: number;
  contentType: string;
}

interface UploadResponse {
  uploadURL: string;
  objectPath: string;
  metadata: UploadMetadata;
}

interface UseUploadOptions {
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * React hook for handling file uploads.
 * Uses presigned URLs for direct client-to-storage uploads (Object Storage).
 * This supports large files without backend buffering.
 */
export function useUpload(options: UseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  /**
   * Upload a file directly to Object Storage using a presigned URL.
   */
  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        // 1. Get presigned URL from backend
        const res = await fetch("/api/object-storage/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error("Failed to get upload URL");
        }

        const { uploadURL } = await res.json();
        setProgress(20);

        // 2. Upload file directly to the signed URL
        const uploadRes = await new Promise<XMLHttpRequest>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadURL);
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 80) + 20;
              setProgress(percent);
            }
          };

          xhr.onload = () => resolve(xhr);
          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.send(file);
        });

        if (uploadRes.status !== 200) {
          throw new Error(`Upload failed with status ${uploadRes.status}`);
        }

        setProgress(100);
        
        const response: UploadResponse = {
          uploadURL,
          objectPath: uploadURL.split("?")[0], // Simplified path extraction
          metadata: {
            name: file.name,
            size: file.size,
            contentType: file.type || "application/octet-stream",
          },
        };

        options.onSuccess?.(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  /**
   * Integration for Uppy to handle files directly via signed URLs.
   */
  const getUploadParameters = useCallback(
    async (
      file: UppyFile<Record<string, unknown>, Record<string, unknown>>
    ): Promise<{
      method: "PUT";
      url: string;
      headers?: Record<string, string>;
    }> => {
      const res = await fetch("/api/object-storage/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadURL } = await res.json();

      return {
        method: "PUT",
        url: uploadURL,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      };
    },
    []
  );

  return {
    uploadFile,
    getUploadParameters,
    isUploading,
    error,
    progress,
  };
}
