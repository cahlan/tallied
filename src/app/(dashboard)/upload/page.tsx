"use client";

import { useState, useMemo } from "react";
import { Dropzone } from "@/components/upload/dropzone";
import { UploadPreview } from "@/components/upload/upload-preview";
import { ExtractionResult } from "@/components/upload/extraction-result";
import { uploadReceipt } from "@/actions/upload";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<Transaction | null>(null);

  const previewUrl = useMemo(() => {
    if (!file || file.type === "application/pdf") return null;
    return URL.createObjectURL(file);
  }, [file]);

  async function handleFileSelected(selectedFile: File) {
    setFile(selectedFile);
    setResult(null);
    setExtracting(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await uploadReceipt(formData);

    if (response.error) {
      toast.error(response.error);
      setExtracting(false);
      return;
    }

    if (response.data) {
      setResult(response.data);
    }
    setExtracting(false);
  }

  function handleRemove() {
    setFile(null);
    setResult(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Upload receipt
      </h1>

      {!file && !result && (
        <Dropzone onFileSelected={handleFileSelected} disabled={extracting} />
      )}

      {file && !result && (
        <div className="space-y-4">
          <UploadPreview
            file={file}
            previewUrl={previewUrl}
            onRemove={handleRemove}
          />
          {extracting && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Extracting receipt data...</span>
            </div>
          )}
        </div>
      )}

      {result && <ExtractionResult transaction={result} />}
    </div>
  );
}
