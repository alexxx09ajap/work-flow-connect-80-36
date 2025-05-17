
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Send, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useChat } from '@/contexts/ChatContext';
import { MessageType, ChatType } from '@/types';
import EmojiPicker from '@/components/EmojiPicker';
import ChatMobileSheet from '@/components/ChatMobileSheet';
import { useMobile } from '@/hooks/use-mobile';

const ChatsPage = () => {
  const { currentUser } = useAuth();
  const { getUserById } = useData();
  const { chats, activeChat, getMessages, setActiveChat, sendMessage, updateMessage, deleteMessage, leaveChat } = useChat();
  const [messageText, setMessageText] = useState('');
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);
  const [isConfirmingLeave, setIsConfirmingLeave] = useState<boolean>(false);
  const isMobile = useMobile();
  const [isMobileChat, setIsMobileChat] = useState(false);

  // Filtrar mensajes para el chat activo
  const activeMessages = activeChat ? getMessages(activeChat.id) : [];

  useEffect(() => {
    if (isMobile && activeChat) {
      setIsMobileChat(true);
    }
  }, [activeChat, isMobile]);

  // Manejar el envío de mensajes
  const handleSendMessage = () => {
    if (messageText.trim() && activeChat) {
      if (editingMessage) {
        // Editar mensaje existente
        updateMessage(editingMessage.id, messageText.trim());
        setEditingMessage(null);
      } else {
        // Enviar nuevo mensaje
        sendMessage(activeChat.id, messageText.trim());
      }
      setMessageText('');
    }
  };

  // Manejar selección de emoji
  const handleEmojiClick = (emoji: string) => {
    setMessageText(prev => prev + emoji);
  };

  // Obtener el nombre del chat según los participantes
  const getChatName = (chat: ChatType): string => {
    if (chat.isGroup) return chat.name || 'Grupo';
    
    // Para chats directos, mostrar el nombre del otro usuario
    const otherParticipant = chat.participants.find(p => p !== currentUser?.id);
    if (!otherParticipant) return 'Chat';
    
    const user = getUserById(otherParticipant);
    return user?.name || 'Usuario';
  };

  // Manejar la pulsación de teclas para enviar mensajes
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Manejar salida de un chat
  const handleLeaveChat = () => {
    if (activeChat) {
      leaveChat(activeChat.id);
      setIsConfirmingLeave(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
        <h1 className="text-2xl font-bold mb-4">Chats</h1>

        <div className="flex flex-1 gap-4 h-full">
          {/* Barra lateral de chats */}
          <div className="hidden md:flex md:w-1/3 lg:w-1/4 flex-col gap-2 overflow-y-auto">
            {chats.map(chat => (
              <Card 
                key={chat.id}
                className={`p-3 cursor-pointer ${activeChat?.id === chat.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chat.isGroup ? undefined : getUserById(chat.participants.find(p => p !== currentUser?.id) || '')?.photoURL} />
                    <AvatarFallback>
                      {chat.isGroup ? 'G' : getUserById(chat.participants.find(p => p !== currentUser?.id) || '')?.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-medium text-sm truncate">{getChatName(chat)}</h3>
                    <p className="text-xs text-gray-500 truncate">
                      {typeof chat.lastMessage === 'string' 
                        ? chat.lastMessage 
                        : chat.lastMessage?.content || 'No hay mensajes aún'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Lista de chat para móvil */}
          <div className="flex md:hidden w-full flex-col gap-2 overflow-y-auto">
            {!activeChat ? (
              chats.map(chat => (
                <Card 
                  key={chat.id}
                  className={`p-3 cursor-pointer`}
                  onClick={() => {
                    setActiveChat(chat);
                    setIsMobileChat(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={chat.isGroup ? undefined : getUserById(chat.participants.find(p => p !== currentUser?.id) || '')?.photoURL} />
                      <AvatarFallback>
                        {chat.isGroup ? 'G' : getUserById(chat.participants.find(p => p !== currentUser?.id) || '')?.name?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-medium text-sm truncate">{getChatName(chat)}</h3>
                      <p className="text-xs text-gray-500 truncate">
                        {typeof chat.lastMessage === 'string' 
                          ? chat.lastMessage 
                          : chat.lastMessage?.content || 'No hay mensajes aún'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : null}
          </div>

          {/* Vista de chat */}
          {activeChat && !isMobile && (
            <div className="hidden md:flex flex-col flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
              {/* Cabecera del chat */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={activeChat.isGroup ? undefined : getUserById(activeChat.participants.find(p => p !== currentUser?.id) || '')?.photoURL} />
                    <AvatarFallback>
                      {activeChat.isGroup ? 'G' : getUserById(activeChat.participants.find(p => p !== currentUser?.id) || '')?.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium">{getChatName(activeChat)}</h3>
                </div>
                
                {/* Botón de Salir del grupo para escritorio */}
                {activeChat.isGroup && (
                  <AlertDialog open={isConfirmingLeave} onOpenChange={setIsConfirmingLeave}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                      >
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Salir del grupo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas salir del grupo? No podrás acceder a los mensajes anteriores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLeaveChat}>Salir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              {/* Mensajes del chat */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-gray-500">No hay mensajes aún</p>
                    <p className="text-sm text-gray-400 mt-2">Envía un mensaje para iniciar la conversación</p>
                  </div>
                ) : (
                  activeMessages.map(message => {
                    const isCurrentUser = currentUser && message.senderId === currentUser.id;
                    const isSystemMessage = message.senderId === "system";
                    const sender = isSystemMessage ? null : getUserById(message.senderId);
                    const isDeleted = message.deleted;
                    
                    return (
                      <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}>
                        {!isCurrentUser && !isSystemMessage && (
                          <Avatar className="h-8 w-8 mr-2 self-end">
                            <AvatarImage src={sender?.photoURL} />
                            <AvatarFallback>{sender?.name?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className="max-w-[70%]">
                          {!isCurrentUser && !isSystemMessage && activeChat.isGroup && (
                            <div className="text-xs text-gray-500 ml-1 mb-1">
                              {sender?.name || 'Usuario'}
                            </div>
                          )}
                          
                          <div className={`px-4 py-2 rounded-2xl relative ${
                            isSystemMessage 
                              ? 'mx-auto bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs py-1 px-3 rounded-full'
                              : isDeleted
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 italic'
                                : isCurrentUser 
                                  ? 'bg-[#9b87f5] text-white rounded-br-none' 
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                          }`}>
                            <p className="break-words">{message.content}</p>
                            
                            {isCurrentUser && !isDeleted && !isSystemMessage && (
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => setEditingMessage({ id: message.id, content: message.content })}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => setIsConfirmingDelete(message.id)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </Button>
                              </div>
                            )}
                            
                            {message.edited && !isDeleted && !isSystemMessage && (
                              <span className="text-xs opacity-70 ml-1">(editado)</span>
                            )}
                          </div>
                          
                          <div className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                            {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        {isCurrentUser && !isSystemMessage && (
                          <Avatar className="h-8 w-8 ml-2 self-end">
                            <AvatarImage src={currentUser.photoURL} />
                            <AvatarFallback>{currentUser.name?.charAt(0).toUpperCase() || 'Y'}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Entrada de mensaje */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                  <Input
                    placeholder={editingMessage ? "Editar mensaje..." : "Escribe un mensaje..."}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-[#9b87f5] hover:bg-[#8a74f0]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmación de eliminación de mensaje */}
        <AlertDialog open={!!isConfirmingDelete} onOpenChange={(open) => !open && setIsConfirmingDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar mensaje?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este mensaje?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (isConfirmingDelete && activeChat) {
                  deleteMessage(isConfirmingDelete);
                  setIsConfirmingDelete(null);
                }
              }}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Vista de chat para móvil con soporte de emojis */}
        {activeChat && (
          <ChatMobileSheet
            isOpen={isMobileChat}
            onClose={() => setIsMobileChat(false)}
            title={getChatName(activeChat)}
            messages={activeMessages}
            isGroup={activeChat.isGroup}
            onEditMessage={(id, content) => setEditingMessage({ id, content })}
            onDeleteMessage={(id) => setIsConfirmingDelete(id)}
            onLeaveGroup={activeChat.isGroup ? handleLeaveChat : undefined}
          >
            <div className="flex items-center space-x-2">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
              <Input
                placeholder={editingMessage ? "Editar mensaje..." : "Escribe un mensaje..."}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="bg-[#9b87f5] hover:bg-[#8a74f0]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </ChatMobileSheet>
        )}
      </div>
    </MainLayout>
  );
};

export default ChatsPage;
