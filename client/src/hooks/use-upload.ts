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
 * React hook for handling file uploads purely on the client side.
 * This avoids any backend dependency by converting files to Base64 strings.
 * Note: Base64 increases file size by ~33%, so it's best for reasonable file sizes.
 */
export function useUpload(options: UseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  /**
   * Process a file locally by converting it to a Base64 string.
   */
  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        setProgress(10);
        
        // Use FileReader to convert file to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 90);
              setProgress(percent);
            }
          };

          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Erro ao ler o arquivo localmente"));
          reader.readAsDataURL(file);
        });

        setProgress(100);
        
        const response: UploadResponse = {
          uploadURL: base64,
          objectPath: file.name,
          metadata: {
            name: file.name,
            size: file.size,
            contentType: file.type || "application/octet-stream",
          },
        };

        options.onSuccess?.(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Falha no processamento do arquivo");
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
   * Simulated parameters for Uppy to handle files locally.
   */
  const getUploadParameters = useCallback(
    async (
      file: UppyFile<Record<string, unknown>, Record<string, unknown>>
    ): Promise<{
      method: "PUT";
      url: string;
      headers?: Record<string, string>;
    }> => {
      // Mock URL for client-side only environments
      return {
        method: "PUT",
        url: "blob:local",
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
