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
 * React hook for handling file uploads directly to Cloudinary from the client.
 * Uses unsigned upload presets for Netlify/Static compatibility.
 */
export function useUpload(options: UseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  /**
   * Uploads a file directly to Cloudinary using an unsigned upload preset.
   */
  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      
      if (file.size > MAX_SIZE) {
        const error = new Error("O arquivo excede o limite de 10MB.");
        setError(error);
        options.onError?.(error);
        return null;
      }

      if (!cloudName || !uploadPreset) {
        const error = new Error("Configuração do Cloudinary ausente (VITE_CLOUDINARY_CLOUD_NAME ou VITE_CLOUDINARY_UPLOAD_PRESET).");
        setError(error);
        options.onError?.(error);
        return null;
      }

      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const xhr = new XMLHttpRequest();
        const promise = new Promise<UploadResponse>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setProgress(percent);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              resolve({
                uploadURL: response.secure_url,
                objectPath: response.public_id,
                metadata: {
                  name: file.name,
                  size: file.size,
                  contentType: file.type || "application/octet-stream",
                },
              });
            } else {
              reject(new Error(`Erro no upload: ${xhr.statusText}`));
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Erro de rede no upload")));
          xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
          xhr.send(formData);
        });

        const result = await promise;
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Falha no upload do arquivo");
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options, cloudName, uploadPreset]
  );

  /**
   * Configures Uppy to upload directly to Cloudinary.
   */
  const getUploadParameters = useCallback(
    async (
      file: UppyFile<Record<string, unknown>, Record<string, unknown>>
    ): Promise<{
      method: "POST";
      url: string;
      fields?: Record<string, string>;
    }> => {
      if (!cloudName || !uploadPreset) {
        throw new Error("Configuração do Cloudinary ausente.");
      }

      return {
        method: "POST",
        url: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        fields: {
          upload_preset: uploadPreset,
        },
      };
    },
    [cloudName, uploadPreset]
  );

  return {
    uploadFile,
    getUploadParameters,
    isUploading,
    error,
    progress,
  };
}
