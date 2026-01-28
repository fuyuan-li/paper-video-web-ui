import { useCallback, useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

export function FileUpload({ onFileSelect, isUploading }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {!selectedFile ? (
        <label
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center w-full min-h-[320px] p-8 transition-all duration-300 ease-out border-2 border-dashed rounded-3xl cursor-pointer group hover:border-primary/50 hover:bg-primary/5",
            isDragging 
              ? "border-primary bg-primary/10 scale-[1.02] shadow-xl shadow-primary/10" 
              : "border-border bg-white/50"
          )}
        >
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleChange}
            disabled={isUploading}
          />
          
          <div className={cn(
            "p-5 mb-6 rounded-full bg-secondary/50 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary/10",
            isDragging && "scale-110 bg-primary/20"
          )}>
            <UploadCloud className="w-10 h-10" />
          </div>
          
          <h3 className="mb-2 text-2xl font-bold text-center font-display text-foreground">
            {isDragging ? "Drop your PDF here" : "Upload your PDF"}
          </h3>
          
          <p className="mb-6 text-center text-muted-foreground max-w-xs">
            Drag & drop your document or click to browse. We'll transform it into engaging video clips.
          </p>
          
          <div className="px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-full bg-muted text-muted-foreground">
            PDF up to 10MB
          </div>
        </label>
      ) : (
        <div className="relative overflow-hidden bg-white border shadow-2xl rounded-3xl border-border/50 shadow-indigo-500/10 animate-in fade-in zoom-in-95 duration-300">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-primary/10 text-primary">
              <FileText className="w-8 h-8" />
            </div>
            
            <h3 className="mb-1 text-xl font-bold truncate text-foreground font-display">
              {selectedFile.name}
            </h3>
            <p className="mb-8 text-sm text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className={cn(
                  "w-full py-4 text-base font-semibold rounded-xl btn-primary-gradient flex items-center justify-center gap-2",
                  isUploading && "opacity-80 cursor-not-allowed"
                )}
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Generate Video Clips
                  </>
                )}
              </button>
              
              <button
                onClick={clearFile}
                disabled={isUploading}
                className="w-full py-3 text-sm font-medium transition-colors rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                Choose a different file
              </button>
            </div>
          </div>
          
          {isUploading && (
            <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full">
              <div className="h-full bg-primary animate-[loading_2s_ease-in-out_infinite]" style={{ width: '30%' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
