
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CloudUploadIcon, FileText, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentUploadProps {
  loanId: string;
  onComplete?: (urls: Record<string, string>) => void;
}

type DocumentType = "id_document" | "proof_of_income" | "bank_statement";

const DocumentUpload: React.FC<DocumentUploadProps> = ({ loanId, onComplete }) => {
  const [uploading, setUploading] = useState<Record<DocumentType, boolean>>({
    id_document: false,
    proof_of_income: false,
    bank_statement: false,
  });
  const [files, setFiles] = useState<Record<DocumentType, File | null>>({
    id_document: null,
    proof_of_income: null,
    bank_statement: null,
  });
  const [fileUrls, setFileUrls] = useState<Record<DocumentType, string>>({
    id_document: "",
    proof_of_income: "",
    bank_statement: "",
  });

  const documentTypes: Array<{ id: DocumentType; label: string; description: string }> = [
    {
      id: "id_document",
      label: "ID Document",
      description: "Upload a scanned copy of your ID document or passport",
    },
    {
      id: "proof_of_income",
      label: "Proof of Income",
      description: "Upload your recent payslip or proof of income",
    },
    {
      id: "bank_statement",
      label: "Bank Statement",
      description: "Upload your latest 3-month bank statement",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFiles({ ...files, [type]: null });
      return;
    }
    
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      toast.error("File too large", {
        description: "The maximum file size is 5MB",
      });
      return;
    }
    
    setFiles({ ...files, [type]: file });
  };

  const uploadFile = async (type: DocumentType) => {
    try {
      const file = files[type];
      if (!file) return;
      
      setUploading({ ...uploading, [type]: true });
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${loanId}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `loan-documents/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('loans')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('loans')
        .getPublicUrl(filePath);
      
      if (data) {
        // Update file URLs state
        const newFileUrls = { ...fileUrls, [type]: data.publicUrl };
        setFileUrls(newFileUrls);
        
        // Update loan application with document URL
        const updateData: Record<string, any> = {};
        updateData[`${type}_url`] = data.publicUrl;
        
        const { error: updateError } = await supabase
          .from('loan_applications')
          .update(updateData)
          .eq('id', loanId);
        
        if (updateError) throw updateError;
        
        toast.success(`${getDocumentTypeLabel(type)} uploaded successfully`);
        
        // Check if all documents are uploaded
        const allUploaded = Object.values(newFileUrls).every(url => url);
        if (allUploaded && onComplete) {
          onComplete(newFileUrls);
        }
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${getDocumentTypeLabel(type)}`, {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };
  
  const removeFile = (type: DocumentType) => {
    setFiles({ ...files, [type]: null });
  };
  
  const getDocumentTypeLabel = (type: DocumentType): string => {
    const document = documentTypes.find(doc => doc.id === type);
    return document ? document.label : type;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Required Documents</CardTitle>
        <CardDescription>
          Please upload the following documents to complete your loan application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {documentTypes.map(({ id, label, description }) => (
          <div key={id} className="border rounded-lg p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-sm">{label}</h3>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                {fileUrls[id] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      window.open(fileUrls[id], '_blank');
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {files[id] ? (
                  <div className="flex items-center gap-2 text-xs border rounded-md py-1 px-2 bg-muted w-full">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="truncate">{files[id]?.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-6 w-6 p-0"
                      onClick={() => removeFile(id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative w-full">
                    <input
                      type="file"
                      id={`file-${id}`}
                      className="sr-only"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileChange(e, id)}
                    />
                    <label
                      htmlFor={`file-${id}`}
                      className="cursor-pointer flex items-center justify-center gap-2 text-xs border rounded-md py-2 px-3 bg-muted w-full hover:bg-muted/80 transition-colors"
                    >
                      <CloudUploadIcon className="h-4 w-4" />
                      <span>Choose file</span>
                    </label>
                  </div>
                )}
                
                <Button
                  size="sm"
                  disabled={!files[id] || uploading[id] || !!fileUrls[id]}
                  onClick={() => uploadFile(id)}
                  className="h-8"
                >
                  {uploading[id] ? "Uploading..." : "Upload"}
                </Button>
              </div>
              
              {fileUrls[id] && (
                <p className="text-xs text-green-600 mt-1">✓ Document uploaded successfully</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
