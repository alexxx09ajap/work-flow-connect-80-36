
import React, { useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { MessageType } from '@/types';
import { Info, MoreVertical, Edit, Trash2, ArrowLeft } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import FileAttachment from './FileAttachment';

interface ChatMobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  messages: MessageType[];
  isGroup?: boolean;
  children?: React.ReactNode;
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
}

const ChatMobileSheet: React.FC<ChatMobileSheetProps> = ({
  isOpen,
  onClose,
  title,
  messages,
  isGroup = false,
  children,
  onEditMessage,
  onDeleteMessage
}) => {
  const { currentUser } = useAuth();
  const { getUserById } = useData();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages.length, isOpen]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const formatTime = (timestamp: string | Date) => {
    // Convert to Date object if it's a string
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string | Date) => {
    // Convert to Date object if it's a string
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full h-full p-0 flex flex-col sm:max-w-md">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <SheetTitle className="flex-1 text-left">{title}</SheetTitle>
          </div>
        </SheetHeader>
        
        {/* Messages area */}
        <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-gray-500">No hay mensajes aún</p>
              <p className="text-sm text-gray-400 mt-2">Envía un mensaje para iniciar la conversación</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index, messages) => {
                const isCurrentUser = currentUser && message.senderId === currentUser.id;
                const isSystemMessage = message.senderId === "system";
                const sender = isSystemMessage ? null : getUserById(message.senderId);
                const isDeleted = message.deleted;
                const hasFile = message.file && message.file.filename;
                
                const showDateSeparator = index === 0 || 
                  new Date(message.timestamp).toDateString() !== 
                  new Date(messages[index - 1].timestamp).toDateString();
                
                return (
                  <React.Fragment key={message.id}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-4">
                        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-500">
                          {formatDate(message.timestamp)}
                        </div>
                      </div>
                    )}
                    
                    {isSystemMessage ? (
                      <div className="flex justify-center my-4">
                        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-500 flex items-center">
                          <Info className="h-3 w-3 mr-1" />
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group mb-2`}>
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 mr-2 self-end">
                            <AvatarImage src={sender?.photoURL} />
                            <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                              {sender?.name?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className="max-w-[70%]">
                          {!isCurrentUser && isGroup && (
                            <div className="text-xs text-gray-500 ml-1 mb-1">
                              {sender?.name || 'Usuario'}
                            </div>
                          )}
                          
                          <div className={`px-4 py-2 rounded-2xl relative ${
                            isDeleted
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 italic'
                              : isCurrentUser 
                                ? 'bg-[#9b87f5] text-white rounded-br-none' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                          } group`}>
                            <p className="break-words">{message.content}</p>
                            
                            {/* Message options */}
                            {isCurrentUser && !isDeleted && !hasFile && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 p-0 absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                                  >
                                    <MoreVertical className="h-4 w-4 text-white" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2">
                                  <div className="flex flex-col space-y-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="flex justify-start px-2"
                                      onClick={() => onEditMessage(message.id, message.content)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="flex justify-start text-red-500 hover:text-red-600 px-2"
                                      onClick={() => onDeleteMessage(message.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eliminar
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                            
                            {/* Edited indicator */}
                            {message.edited && !isDeleted && (
                              <span className="text-xs opacity-70 ml-1">(editado)</span>
                            )}
                          </div>
                          
                          {/* Render file attachment if present */}
                          {hasFile && !isDeleted && message.file && (
                            <div className="mt-1">
                              <FileAttachment 
                                id={message.file.id || ''} 
                                filename={message.file.filename}
                                contentType={message.file.contentType}
                                size={message.file.size}
                                uploadedBy={message.file.uploadedBy || message.senderId}
                                onDelete={() => onDeleteMessage(message.id)}
                              />
                            </div>
                          )}
                          
                          <div className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                        
                        {isCurrentUser && (
                          <Avatar className="h-8 w-8 ml-2 self-end">
                            <AvatarImage src={currentUser.photoURL} />
                            <AvatarFallback className="bg-[#9b87f5] text-white text-xs">
                              {currentUser.name?.charAt(0).toUpperCase() || 'Y'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        {/* Message input with emoji picker */}
        <div className="p-4 border-t">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatMobileSheet;
