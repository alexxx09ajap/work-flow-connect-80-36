
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Send, Plus, UserPlus, Users, Search } from 'lucide-react';
import { ChatGroupForm } from '@/components/ChatGroupForm';
import { toast } from '@/components/ui/use-toast';

const ChatsPage = () => {
  const { chats, activeChat, setActiveChat, sendMessage, onlineUsers } = useChat();
  const { currentUser } = useAuth();
  const { getUserById } = useData();
  const [messageText, setMessageText] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auto-scroll to bottom of messages when new message arrives
  useEffect(() => {
    if (activeChat) {
      const messagesContainer = document.getElementById('messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [activeChat?.messages.length]);
  
  // Function to get chat name
  const getChatName = (chat: any) => {
    if (chat.name) return chat.name;
    
    if (!chat.isGroup && currentUser) {
      // For private chats, show the other user's name
      const otherUserId = chat.participants.find((id: string) => id !== currentUser.id);
      if (otherUserId) {
        const otherUser = getUserById(otherUserId);
        return otherUser ? otherUser.name : 'Chat privado';
      }
    }
    
    return 'Chat';
  };
  
  // Function to get chat avatar
  const getChatAvatar = (chat: any) => {
    if (!chat.isGroup && currentUser) {
      const otherUserId = chat.participants.find((id: string) => id !== currentUser.id);
      if (otherUserId) {
        const otherUser = getUserById(otherUserId);
        return otherUser?.photoURL;
      }
    }
    return undefined;
  };
  
  // For showing the initial in avatar fallback
  const getAvatarFallback = (chat: any) => {
    const name = getChatName(chat);
    return name.charAt(0).toUpperCase();
  };
  
  const handleSendMessage = () => {
    if (!activeChat || !messageText.trim()) return;
    
    sendMessage(activeChat.id, messageText);
    setMessageText('');
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  const filteredChats = chats.filter(chat => 
    getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4">
        {/* Chat list */}
        <Card className="md:w-1/3 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">Mensajes</h2>
              <div className="flex space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full"
                        onClick={() => setIsCreatingGroup(true)}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Crear chat grupal</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full"
                        onClick={() => toast({
                          title: "Próximamente",
                          description: "Esta función estará disponible pronto"
                        })}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Nuevo mensaje</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                {searchQuery ? (
                  <p className="text-gray-500">No se encontraron conversaciones</p>
                ) : (
                  <>
                    <p className="text-gray-500">No tienes ninguna conversación aún</p>
                    <Button 
                      variant="link" 
                      className="mt-2 text-wfc-purple"
                      onClick={() => setIsCreatingGroup(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear un chat
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-3 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                      ${activeChat?.id === chat.id ? 'bg-gray-100 dark:bg-gray-700' : ''}
                    `}
                    onClick={() => setActiveChat(chat)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={getChatAvatar(chat)} />
                        <AvatarFallback className={`bg-wfc-purple-medium text-white`}>
                          {getAvatarFallback(chat)}
                        </AvatarFallback>
                      </Avatar>
                      {chat.isGroup ? (
                        <Badge className="absolute -top-1 -right-1 bg-wfc-purple p-0 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center">
                          <Users className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800
                          ${isUserOnline(chat.participants.find((id: string) => id !== currentUser?.id)) 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'}
                        `} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium leading-tight">{getChatName(chat)}</h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-400">
                            {formatTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {chat.lastMessage 
                          ? chat.lastMessage.content 
                          : 'No hay mensajes aún'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
        
        {/* Chat area */}
        <Card className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={getChatAvatar(activeChat)} />
                  <AvatarFallback className="bg-wfc-purple-medium text-white">
                    {getAvatarFallback(activeChat)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{getChatName(activeChat)}</h2>
                  <p className="text-xs text-gray-500">
                    {activeChat.isGroup 
                      ? `${activeChat.participants.length} participantes` 
                      : isUserOnline(activeChat.participants.find((id: string) => id !== currentUser?.id))
                        ? 'En línea'
                        : 'Desconectado'
                    }
                  </p>
                </div>
              </div>
              
              {/* Messages */}
              <CardContent id="messages-container" className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeChat.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-gray-500">No hay mensajes aún</p>
                    <p className="text-sm text-gray-400 mt-2">Envía un mensaje para iniciar la conversación</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeChat.messages.map((message: any, index: number, messages: any[]) => {
                      const isCurrentUser = currentUser && message.senderId === currentUser.id;
                      const sender = getUserById(message.senderId);
                      
                      // Check if we should display a date separator
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
                          
                          <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            {!isCurrentUser && (
                              <Avatar className="h-8 w-8 mr-2 mt-1">
                                <AvatarImage src={sender?.photoURL} />
                                <AvatarFallback className="bg-wfc-purple-medium text-white">
                                  {sender?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={`max-w-[70%]`}>
                              {!isCurrentUser && activeChat.isGroup && (
                                <p className="text-xs text-gray-500 mb-1">{sender?.name}</p>
                              )}
                              <div 
                                className={`rounded-lg px-4 py-2 inline-block
                                  ${isCurrentUser 
                                    ? 'bg-wfc-purple text-white rounded-tr-none' 
                                    : 'bg-gray-100 dark:bg-gray-700 rounded-tl-none'}
                                `}
                              >
                                <p>{message.content}</p>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </CardContent>
              
              {/* Message input area */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-wfc-purple hover:bg-wfc-purple-medium"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <h2 className="text-xl font-semibold">Selecciona un chat</h2>
              <p className="text-gray-500 mt-2">
                Elige una conversación de la lista o inicia una nueva
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsCreatingGroup(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Crear chat grupal
              </Button>
            </div>
          )}
        </Card>
      </div>
      
      {/* Group chat creation modal */}
      <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear chat grupal</DialogTitle>
          </DialogHeader>
          <ChatGroupForm onClose={() => setIsCreatingGroup(false)} />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ChatsPage;
