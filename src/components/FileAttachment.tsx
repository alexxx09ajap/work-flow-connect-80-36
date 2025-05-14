
import React from 'react';
import { fileService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Download, Trash2, File as FileIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

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

// Determine icon and color based on file type
const getFileTypeInfo = (contentType?: string, filename?: string) => {
  if (!contentType && !filename) {
    return { icon: <FileIcon className="h-5 w-5" />, color: 'bg-gray-200' };
  }
  
  const type = contentType?.split('/')[0] || '';
  const extension = filename?.split('.').pop()?.toLowerCase() || '';
  
  // Image files
  if (type === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
    return { 
      icon: <FileIcon className="h-5 w-5" />, 
      color: 'bg-blue-100 text-blue-600' 
    };
  }
  
  // Document files
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
    return { 
      icon: <FileIcon className="h-5 w-5" />, 
      color: 'bg-red-100 text-red-600' 
    };
  }
  
  // Spreadsheet files
  if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return { 
      icon: <FileIcon className="h-5 w-5" />, 
      color: 'bg-green-100 text-green-600' 
    };
  }
  
  // Presentation files
  if (['ppt', 'pptx'].includes(extension)) {
    return { 
      icon: <FileIcon className="h-5 w-5" />, 
      color: 'bg-orange-100 text-orange-600' 
    };
  }
  
  // Compressed files
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return { 
      icon: <FileIcon className="h-5 w-5" />, 
      color: 'bg-purple-100 text-purple-600' 
    };
  }
  
  // Default for other files
  return { 
    icon: <FileIcon className="h-5 w-5" />, 
    color: 'bg-gray-200 text-gray-600' 
  };
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
  const { icon, color } = getFileTypeInfo(contentType, filename);
  
  const handleDownload = () => {
    const url = fileService.getFileUrl(id);
    // Crear un elemento <a> temporal para la descarga
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="flex items-center p-3 border rounded-md bg-gray-50 dark:bg-gray-800 max-w-xs w-full">
      <div className={cn("w-10 h-10 rounded-md flex items-center justify-center mr-3", color)}>
        {icon}
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
