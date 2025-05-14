
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, X, UploadCloud } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El archivo excede el tamaño máximo permitido (5MB)"
      });
      e.target.value = ''; // Reset input
      return;
    }
    
    setSelectedFile(file);
  };
  
  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  const handleClear = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };
  
  const handleSend = () => {
    if (selectedFile) {
      setUploading(true);
      try {
        onFileSelect(selectedFile);
        handleClear();
      } catch (error) {
        console.error('Error sending file:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al enviar el archivo. Intente nuevamente."
        });
      } finally {
        setUploading(false);
      }
    }
  };
  
  return (
    <div className="relative">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="*/*" // Accept all file types
      />
      
      {!selectedFile ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleButtonClick}
          className="rounded-full"
          title="Adjuntar archivo"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
      ) : (
        <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
          <div className="flex-1 truncate text-sm">
            {selectedFile.name}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSend}
            className="h-8 w-8"
            title="Enviar archivo"
            disabled={uploading}
          >
            {uploading ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8 text-red-500 hover:text-red-700"
            title="Cancelar"
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
