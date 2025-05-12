
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronLeft, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { MessageType } from '@/types';

interface ChatMobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  messages: MessageType[];
  isGroup?: boolean;
  children?: React.ReactNode;
}

const ChatMobileSheet = ({
  isOpen,
  onClose,
  title,
  messages,
  isGroup = false,
  children
}: ChatMobileSheetProps) => {
  const { currentUser } = useAuth();
  const { getUserById } = useData();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="sm:max-w-md w-full p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <SheetTitle>{title}</SheetTitle>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((message, index) => {
                const isCurrentUser = currentUser && message.senderId === currentUser.id;
                const isSystemMessage = message.senderId === "system";
                const sender = isSystemMessage ? null : getUserById(message.senderId);
                
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
                        {/* Avatar for received messages only */}
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 mr-2 self-end flex-shrink-0">
                            <AvatarImage src={sender?.photoURL} />
                            <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                              {sender?.name?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className="max-w-[70%]">
                          {/* Sender name for group chats */}
                          {!isCurrentUser && isGroup && (
                            <div className="text-xs text-gray-500 ml-1 mb-1">
                              {sender?.name || 'Usuario'}
                            </div>
                          )}
                          
                          {/* Message bubble with different colors for sent/received */}
                          <div className={`px-4 py-2 rounded-2xl ${
                            isCurrentUser 
                              ? 'bg-[#9b87f5] text-white rounded-br-none' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                          }`}>
                            <p className="break-words">{message.content}</p>
                          </div>
                          
                          {/* Message timestamp */}
                          <div className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                        
                        {/* Avatar for sent messages only */}
                        {isCurrentUser && (
                          <Avatar className="h-8 w-8 ml-2 self-end flex-shrink-0">
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
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-gray-500">No hay mensajes aún</p>
                <p className="text-sm text-gray-400 mt-2">Envía un mensaje para iniciar la conversación</p>
              </div>
            )}
          </div>
          {children && (
            <div className="p-4 border-t">
              {children}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ChatMobileSheet;
