import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import type { UppyFile, UploadResult } from "@uppy/core";
import DashboardModal from "@uppy/react/dashboard-modal";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import XHRUpload from "@uppy/xhr-upload";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  /**
   * Function to get upload parameters for each file.
   */
  onGetUploadParameters: (
    file: UppyFile<Record<string, unknown>, Record<string, unknown>>
  ) => Promise<{
    method: "POST" | "PUT";
    url: string;
    fields?: Record<string, string>;
    headers?: Record<string, string>;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
      },
      autoProceed: false,
    })
      .use(XHRUpload, {
        endpoint: "https://api.cloudinary.com/v1_1/placeholder/image/upload", // Will be overridden
        formData: true,
        fieldName: "file",
        async getResponseData(responseText) {
          return JSON.parse(responseText);
        },
      })
      .on("upload", async (data) => {
        // Override parameters for each file
        for (const fileID of data.fileIDs) {
          const file = uppy.getFile(fileID);
          const params = await onGetUploadParameters(file);
          uppy.setFileState(fileID, {
            xhrUpload: {
              endpoint: params.url,
              method: params.method,
              formData: true,
              fieldName: "file",
              metaFields: Object.keys(params.fields || {}),
            },
          });
          if (params.fields) {
            uppy.setMeta(params.fields);
          }
        }
      })
      .on("complete", (result) => {
        onComplete?.(result);
      })
  );

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName}>
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}

