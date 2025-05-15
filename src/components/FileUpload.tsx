
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, X, UploadCloud } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useChat } from '@/contexts/ChatContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

interface FileUploadProps {
  onFileSelect?: (file: File) => Promise<void>;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const { activeChat, sendFile } = useChat();
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
  
  const handleSend = async () => {
    if (!selectedFile || !activeChat) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No hay chat activo o archivo seleccionado"
      });
      return;
    }
    
    setUploading(true);
    
    try {
      if (onFileSelect) {
        await onFileSelect(selectedFile);
      } else {
        await sendFile(activeChat.id, selectedFile);
      }
      
      handleClear();
      toast({
        title: "Éxito",
        description: "Archivo enviado correctamente"
      });
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
            <div className="font-medium truncate">{selectedFile.name}</div>
            <div className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</div>
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
