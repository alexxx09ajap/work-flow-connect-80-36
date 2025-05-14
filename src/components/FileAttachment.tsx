
import React from 'react';
import { fileService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';
import { FileIcon, defaultStyles } from 'react-file-icon';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface FileProps {
  id: string;
  filename: string;
  contentType?: string;
  size?: number;
  uploadedBy: string;
  onDelete?: () => void;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

const FileAttachment: React.FC<FileProps> = ({ 
  id, 
  filename, 
  contentType, 
  size, 
  uploadedBy,
  onDelete
}) => {
  const { currentUser } = useAuth();
  const isOwner = currentUser?.id === uploadedBy;
  const fileExt = getFileExtension(filename);
  
  const handleDownload = () => {
    const url = fileService.getFileUrl(id);
    window.open(url, '_blank');
  };
  
  const handleDelete = async () => {
    try {
      await fileService.deleteFile(id);
      toast({
        title: "Archivo eliminado",
        description: "El archivo ha sido eliminado correctamente"
      });
      
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el archivo"
      });
    }
  };
  
  return (
    <div className="flex items-center p-3 border rounded-md bg-gray-50 dark:bg-gray-800 max-w-xs">
      <div className="w-8 h-10 mr-3">
        <FileIcon 
          extension={fileExt}
          {...defaultStyles[fileExt as keyof typeof defaultStyles]}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" title={filename}>
          {filename}
        </p>
        <p className="text-xs text-gray-500">
          {formatFileSize(size)}
        </p>
      </div>
      
      <div className="flex space-x-1 ml-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDownload}
          title="Descargar archivo"
        >
          <Download className="h-4 w-4" />
        </Button>
        
        {isOwner && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
            title="Eliminar archivo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileAttachment;
