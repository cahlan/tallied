"use client";

import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";

interface UploadPreviewProps {
  file: File;
  previewUrl: string | null;
  onRemove: () => void;
}

export function UploadPreview({ file, previewUrl, onRemove }: UploadPreviewProps) {
  const isPdf = file.type === "application/pdf";
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="relative rounded-lg border bg-muted/30 p-4">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {isPdf ? (
            <div className="flex h-24 w-24 items-center justify-center rounded-md bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          ) : previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Receipt preview"
              className="h-24 w-24 rounded-md object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">{sizeMb} MB</p>
        </div>
      </div>
    </div>
  );
}
