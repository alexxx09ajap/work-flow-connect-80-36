
import { useState, useRef, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Send, 
  Plus, 
  Search,
  MessageCircle 
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ChatsPage = () => {
  const { chats, activeChat, setActiveChat, sendMessage, createChat, loadingChats, onlineUsers } = useChat();
  const { currentUser } = useAuth();
  const { users } = useData();
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filtrar chats según término de búsqueda
  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    
    if (chat.isGroup) {
      return chat.name.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      // Encontrar al otro participante en un chat privado
      const otherUserId = chat.participants.find(id => id !== currentUser?.id);
      const otherUser = users.find(user => user.id === otherUserId);
      return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  // Función para obtener el nombre del chat
  const getChatName = (chat: typeof chats[0]) => {
    if (chat.isGroup) {
      return chat.name;
    } else {
      // Encontrar al otro participante en un chat privado
      const otherUserId = chat.participants.find(id => id !== currentUser?.id);
      const otherUser = users.find(user => user.id === otherUserId);
      return otherUser?.name || 'Chat privado';
    }
  };

  // Función para obtener la imagen del chat
  const getChatImage = (chat: typeof chats[0]) => {
    if (chat.isGroup) {
      return undefined;
    } else {
      const otherUserId = chat.participants.find(id => id !== currentUser?.id);
      const otherUser = users.find(user => user.id === otherUserId);
      return otherUser?.photoURL;
    }
  };

  // Scroll al final de los mensajes cuando se carga un chat o llega un nuevo mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!messageText.trim() || !activeChat) return;
    
    sendMessage(activeChat.id, messageText.trim());
    setMessageText('');
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selecciona al menos un usuario"
      });
      return;
    }
    
    // Si es un grupo, verificar que tenga nombre
    if (selectedUsers.length > 1 && !groupName.trim()) {
      toast({
        variant: "destructive",
        title: "Nombre requerido",
        description: "Los chats grupales requieren un nombre"
      });
      return;
    }
    
    createChat(
      selectedUsers, 
      selectedUsers.length > 1 ? groupName.trim() : ''
    );
    
    // Limpiar formulario
    setSelectedUsers([]);
    setGroupName('');
    setIsCreatingChat(false);
    
    toast({
      title: selectedUsers.length > 1 ? "Grupo creado" : "Chat iniciado",
      description: selectedUsers.length > 1 
        ? `Se ha creado el grupo "${groupName.trim()}"`
        : "Se ha iniciado un nuevo chat"
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row h-[calc(100vh-16rem)]">
        {/* Sidebar con lista de chats */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 md:pr-3">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Mensajes</h2>
              <Dialog open={isCreatingChat} onOpenChange={setIsCreatingChat}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nuevo chat</DialogTitle>
                    <DialogDescription>
                      Selecciona usuarios para iniciar una conversación.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 pt-4">
                    {selectedUsers.length > 1 && (
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Nombre del grupo
                        </label>
                        <Input
                          placeholder="Ej: Proyecto Web"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium block mb-1">
                        Seleccionar usuarios
                      </label>
                      <div className="border rounded-md p-2 max-h-60 overflow-y-auto space-y-2">
                        {users
                          .filter(user => user.id !== currentUser?.id)
                          .map(user => (
                          <div 
                            key={user.id} 
                            className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                              selectedUsers.includes(user.id) 
                                ? 'bg-wfc-purple/10 border border-wfc-purple/30' 
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              if (selectedUsers.includes(user.id)) {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                              } else {
                                setSelectedUsers([...selectedUsers, user.id]);
                              }
                            }}
                          >
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={user.photoURL} alt={user.name} />
                                <AvatarFallback className="bg-wfc-purple-medium text-white">
                                  {user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                            {onlineUsers.includes(user.id) && (
                              <Badge className="bg-green-500">Online</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsCreatingChat(false);
                          setSelectedUsers([]);
                          setGroupName('');
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        className="bg-wfc-purple hover:bg-wfc-purple-medium"
                        onClick={handleCreateChat}
                      >
                        {selectedUsers.length > 1 ? 'Crear grupo' : 'Iniciar chat'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar chats..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {loadingChats ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">Cargando conversaciones...</p>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No hay conversaciones</p>
                  <Button 
                    className="mt-4 bg-wfc-purple hover:bg-wfc-purple-medium"
                    onClick={() => setIsCreatingChat(true)}
                  >
                    Iniciar chat
                  </Button>
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-2">
                  {filteredChats.map(chat => {
                    const isActive = activeChat?.id === chat.id;
                    const chatName = getChatName(chat);
                    const chatImage = getChatImage(chat);
                    
                    return (
                      <div
                        key={chat.id}
                        className={`flex items-center p-3 rounded-lg cursor-pointer ${
                          isActive 
                            ? 'bg-wfc-purple/10 border border-wfc-purple/30' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setActiveChat(chat)}
                      >
                        {chat.isGroup ? (
                          <div className="h-10 w-10 rounded-full bg-wfc-purple/20 flex items-center justify-center text-wfc-purple mr-3">
                            <Users className="h-5 w-5" />
                          </div>
                        ) : (
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={chatImage} alt={chatName} />
                            <AvatarFallback className="bg-wfc-purple-medium text-white">
                              {chatName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium truncate">{chatName}</h3>
                            {chat.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatTime(chat.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {chat.lastMessage 
                              ? chat.lastMessage.content 
                              : 'No hay mensajes'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
        
        {/* Área de chat */}
        <div className="flex-1 flex flex-col md:pl-3">
          {activeChat ? (
            <>
              {/* Cabecera del chat */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center">
                  {activeChat.isGroup ? (
                    <div className="h-10 w-10 rounded-full bg-wfc-purple/20 flex items-center justify-center text-wfc-purple">
                      <Users className="h-5 w-5" />
                    </div>
                  ) : (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getChatImage(activeChat)} alt={getChatName(activeChat)} />
                      <AvatarFallback className="bg-wfc-purple-medium text-white">
                        {getChatName(activeChat).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="ml-3">
                    <h2 className="font-semibold">{getChatName(activeChat)}</h2>
                    <div className="flex items-center text-sm text-gray-500">
                      {activeChat.isGroup ? (
                        <span>{activeChat.participants.length} participantes</span>
                      ) : (
                        <span>Chat privado</span>
                      )}
                      {/* Dot separator */}
                      <div className="inline-block h-1 w-1 rounded-full bg-gray-300 mx-2"></div>
                      <span>
                        {activeChat.participants.filter(id => onlineUsers.includes(id)).length} online
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mensajes */}
              <ScrollArea className="flex-1 p-4">
                {activeChat.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No hay mensajes todavía</p>
                      <p className="text-gray-500 text-sm">Sé el primero en enviar un mensaje</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeChat.messages.map((message, index) => {
                      const isCurrentUser = message.senderId === currentUser?.id;
                      const showSender = activeChat.isGroup && !isCurrentUser;
                      const sender = users.find(user => user.id === message.senderId);
                      
                      // Agrupar mensajes del mismo remitente
                      const prevMessage = index > 0 ? activeChat.messages[index - 1] : null;
                      const showAvatar = 
                        !isCurrentUser && 
                        (!prevMessage || prevMessage.senderId !== message.senderId);
                      
                      // Verificar si es un nuevo día
                      const showDateSeparator = index === 0 || (
                        new Date(message.timestamp).toDateString() !== 
                        new Date(activeChat.messages[index - 1].timestamp).toDateString()
                      );
                      
                      return (
                        <div key={message.id}>
                          {showDateSeparator && (
                            <div className="flex justify-center my-4">
                              <Badge variant="outline" className="bg-gray-50 text-gray-500">
                                {new Date(message.timestamp).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </Badge>
                            </div>
                          )}
                          
                          <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                              {showAvatar && (
                                <Avatar className="h-8 w-8 mt-1 mx-2 flex-shrink-0">
                                  <AvatarImage src={sender?.photoURL} alt={sender?.name} />
                                  <AvatarFallback className="bg-wfc-purple-medium text-white">
                                    {sender?.name?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                {showSender && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    {sender?.name}
                                  </span>
                                )}
                                <div 
                                  className={`rounded-lg p-3 ${
                                    isCurrentUser 
                                      ? 'bg-wfc-purple text-white' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  <p>{message.content}</p>
                                  <div className={`text-xs mt-1 ${
                                    isCurrentUser ? 'text-white/70' : 'text-gray-500'
                                  }`}>
                                    {formatTime(message.timestamp)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              {/* Formulario de mensaje */}
              <div className="p-4 border-t border-gray-200">
                <form 
                  className="flex items-center space-x-2"
                  onSubmit={handleSendMessage}
                >
                  <Input 
                    placeholder="Escribe un mensaje..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    className="bg-wfc-purple hover:bg-wfc-purple-medium"
                    disabled={!messageText.trim()}
                  >
                    <Send className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Enviar</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <MessageCircle className="h-16 w-16 text-wfc-purple/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Mensajes</h3>
                <p className="text-gray-500 mb-6">
                  Selecciona un chat para ver los mensajes o inicia uno nuevo.
                </p>
                <Button 
                  className="bg-wfc-purple hover:bg-wfc-purple-medium"
                  onClick={() => setIsCreatingChat(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo chat
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatsPage;
