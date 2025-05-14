
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare, Search } from 'lucide-react';
import { MessageType, ChatType } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface MessageSearchProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeChat: ChatType | null;
  onSearchResultClick: (message: MessageType) => void;
  searchMessages: (query: string, chatId?: string) => Promise<MessageType[]>;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ 
  isOpen, 
  onOpenChange, 
  activeChat,
  onSearchResultClick,
  searchMessages
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<MessageType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { getUserById } = useData();

  useEffect(() => {
    // Reset search on open/close
    if (isOpen) {
      setSearchQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Search only in active chat if there is one
      const searchResults = await searchMessages(
        searchQuery, 
        activeChat ? activeChat.id : undefined
      );
      setResults(searchResults);
    } catch (error) {
      console.error("Error searching messages:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Buscar mensajes {activeChat ? `en ${activeChat.name || 'este chat'}` : ''}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mt-4">
          <Input
            placeholder="Escriba texto para buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={searchQuery.trim().length < 2 || isSearching}
            className="bg-[#9b87f5] hover:bg-[#8a74f0]"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {hasSearched && (
          <ScrollArea className="h-[250px] mt-4">
            {isSearching ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-[#9b87f5]" />
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageSquare className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">No se encontraron mensajes</p>
                <p className="text-sm text-gray-400 mt-1">Intente con otra búsqueda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((message) => {
                  const sender = getUserById(message.senderId);
                  return (
                    <div 
                      key={message.id}
                      className="p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => onSearchResultClick(message)}
                    >
                      <div className="flex items-start space-x-2">
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarImage src={sender?.photoURL} />
                          <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                            {sender?.name?.charAt(0).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{sender?.name || 'Usuario'}</span>
                            <span className="text-xs text-gray-400">{formatDate(message.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                            {message.content}
                          </p>
                          {/* Mostrar el nombre del chat si estamos en búsqueda general */}
                          {!activeChat && message.chatName && (
                            <div className="mt-1">
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">
                                {message.chatIsGroup ? '👥 ' : '👤 '}
                                {message.chatName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageSearch;
