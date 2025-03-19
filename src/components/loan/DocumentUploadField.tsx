
import React, { useState } from "react";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudUploadIcon, X, FileText, File } from "lucide-react";

interface DocumentUploadFieldProps {
  label: string;
  description?: string;
  id: string;
  accept: string;
  onChange: (file: File | null) => void;
  error?: string;
}

const DocumentUploadField: React.FC<DocumentUploadFieldProps> = ({
  label,
  description,
  id,
  accept,
  onChange,
  error,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      onChange(null);
      return;
    }
    
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      e.target.value = '';
      setSelectedFile(null);
      onChange(null);
      return;
    }
    
    setSelectedFile(file);
    onChange(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    onChange(null);
  };

  return (
    <FormItem className="space-y-2">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="flex flex-col space-y-2">
          {selectedFile ? (
            <div className="flex items-center gap-2 text-sm border rounded-md py-2 px-3 bg-muted w-full">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="truncate">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 w-6 p-0"
                onClick={removeFile}
                type="button"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="relative w-full">
              <Input
                type="file"
                id={id}
                className="sr-only"
                accept={accept}
                onChange={handleFileChange}
              />
              <label
                htmlFor={id}
                className="cursor-pointer flex items-center justify-center gap-2 text-sm border border-input rounded-md py-2 px-3 bg-background hover:bg-muted/50 transition-colors w-full"
              >
                <CloudUploadIcon className="h-4 w-4" />
                <span>Choose file</span>
              </label>
            </div>
          )}
        </div>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
};

export default DocumentUploadField;
