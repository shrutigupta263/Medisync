import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReportUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => void;
  isUploading: boolean;
}

const ReportUploadDialog = ({ 
  open, 
  onOpenChange, 
  onUpload, 
  isUploading 
}: ReportUploadDialogProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileUpload = (file: File) => {
    onUpload(file);
    onOpenChange(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        handleFileUpload(file);
      } else {
        toast.error("Please upload only PDF or image files");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        handleFileUpload(file);
      } else {
        toast.error("Please upload only PDF or image files");
      }
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Health Report</DialogTitle>
          <DialogDescription>
            Upload your health report as PDF or image file
          </DialogDescription>
        </DialogHeader>

        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,image/*"
            onChange={handleChange}
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-primary/10 rounded-full">
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-primary" />
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">
                Drag and drop your file here
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                or
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Browse Files"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, JPG, PNG (Max 10MB)
            </p>
            <p className="text-xs text-primary font-medium">
              Upload starts automatically when you select a file
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportUploadDialog;
