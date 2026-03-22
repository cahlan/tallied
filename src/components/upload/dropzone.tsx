"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload, FileImage } from "lucide-react";
import { MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from "@/lib/constants";

interface DropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function Dropzone({ onFileSelected, disabled }: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelected(acceptedFiles[0]);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors cursor-pointer",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {isDragActive ? (
          <FileImage className="h-10 w-10 text-primary" />
        ) : (
          <Upload className="h-10 w-10 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">
            {isDragActive
              ? "Drop your receipt here"
              : "Drag & drop a receipt, or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG, PNG, or PDF up to 10MB
          </p>
        </div>
      </div>
    </div>
  );
}
