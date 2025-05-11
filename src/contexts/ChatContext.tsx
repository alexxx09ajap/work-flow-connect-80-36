
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ChatType, MessageType, UserType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import io, { Socket } from 'socket.io-client';
import { chatService, messageService } from '@/services/api';

// Context Type
export interface ChatContextType {
  createChat: (participantIds: string[], name?: string) => void;
  createPrivateChat: (userId: string) => Promise<ChatType | undefined>;
  sendMessage: (chatId: string, content: string) => void;
  deleteChat: (chatId: string) => void;
  setActiveChat: (chat: ChatType | null) => void;
  markAsRead: (chatId: string) => void;
  getMessages: (chatId: string) => MessageType[];
  findExistingPrivateChat: (userId: string) => ChatType | undefined;
  activeChat: ChatType | null;
  chats: ChatType[];
  onlineUsers: string[];
  loadingChats: boolean;
  addParticipantToChat: (chatId: string, userId: string) => Promise<boolean>;
  loadChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [messages, setMessages] = useState<Record<string, MessageType[]>>({});
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loadingChats, setLoadingChats] = useState<boolean>(false);
  
  // Connect to socket when user logs in
  useEffect(() => {
    if (!currentUser) return;

    // Initialize Socket.io connection
    try {
      const newSocket = io('http://localhost:5000', {
        query: {
          userId: currentUser.id
        },
        withCredentials: true
      });

      // Socket event listeners
      newSocket.on('connect', () => {
        console.log('Connected to Socket.io server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from Socket.io server');
      });

      newSocket.on('user:online', (userId: string) => {
        setOnlineUsers((prev) => [...prev, userId]);
      });

      newSocket.on('user:offline', (userId: string) => {
        setOnlineUsers((prev) => prev.filter(id => id !== userId));
      });

      newSocket.on('chat:message', (chatId: string, message: MessageType) => {
        // Add message to messages state
        setMessages((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), message]
        }));

        // Update chat's lastMessage
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  lastMessage: {
                    content: message.content,
                    timestamp: message.timestamp
                  }
                }
              : chat
          )
        );

        // If this chat is active, mark messages as read
        if (activeChat?.id === chatId) {
          markAsRead(chatId);
        } else {
          // Show notification for new message
          toast({
            title: `Nuevo mensaje de ${message.senderName}`,
            description: message.content
          });
        }
      });

      setSocket(newSocket);

      // Load chats when user logs in
      loadChats();
    } catch (error) {
      console.error("Failed to connect to socket:", error);
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [currentUser]);

  // Load user's chats
  const loadChats = async () => {
    if (!currentUser) return;
    
    setLoadingChats(true);
    
    try {
      const chatsData = await chatService.getChats();
      console.log("Loaded chats:", chatsData);
      setChats(chatsData || []);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los chats"
      });
    } finally {
      setLoadingChats(false);
    }
  };

  // Create a new chat
  const createChat = async (participantIds: string[], name?: string) => {
    if (!currentUser) return;
    
    try {
      // Create the chat based on whether it's a group or private chat
      const isGroup = participantIds.length > 1 || name;
      let newChat;
      
      if (isGroup) {
        newChat = await chatService.createGroupChat(name || "Nuevo grupo", participantIds);
      } else {
        newChat = await chatService.createPrivateChat(participantIds[0]);
      }
      
      console.log("Created chat:", newChat);
      
      // Add the new chat to the state
      setChats(prev => [...prev, newChat]);
      
      // Set as active chat
      setActiveChat(newChat);
      
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el chat"
      });
    }
  };

  // Find an existing private chat with a user
  const findExistingPrivateChat = (userId: string): ChatType | undefined => {
    if (!currentUser) return undefined;
    
    // Filter for non-group chats that include both the current user and the target user
    return chats.find(chat => 
      !chat.isGroup && 
      chat.participants && 
      chat.participants.some(p => p === userId) && 
      chat.participants.some(p => p === currentUser.id)
    );
  };

  // Send a message
  const sendMessage = async (chatId: string, content: string) => {
    if (!currentUser || !socket) return;
    
    try {
      const message = await messageService.sendMessage(chatId, content);
      
      console.log("Sent message:", message);
      
      // Add message to local state if the socket doesn't handle it immediately
      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), message]
      }));
      
      // Update chat lastMessage
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lastMessage: {
                  content: message.content,
                  timestamp: message.createdAt
                }
              }
            : chat
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje"
      });
    }
  };

  // Get messages for a chat
  const getMessages = (chatId: string) => {
    return messages[chatId] || [];
  };

  // Mark messages as read
  const markAsRead = async (chatId: string) => {
    if (!currentUser) return;
    
    try {
      // This endpoint would need to be implemented in your backend
      await fetch(`http://localhost:5000/api/chats/${chatId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Delete a chat
  const deleteChat = async (chatId: string) => {
    if (!currentUser) return;
    
    try {
      await chatService.deleteChat(chatId);
      
      // Remove chat from state
      setChats((prev) => prev.filter(chat => chat.id !== chatId));
      
      // If the active chat is deleted, set activeChat to null
      if (activeChat?.id === chatId) {
        setActiveChat(null);
      }
      
      toast({
        title: "Chat eliminado",
        description: "El chat ha sido eliminado exitosamente"
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el chat"
      });
    }
  };

  // Add a participant to a group chat
  const addParticipantToChat = async (chatId: string, userId: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      await chatService.addUsersToChat(chatId, [userId]);
      
      // Update chat in state by reloading chats
      await loadChats();
      
      toast({
        title: "Participante agregado",
        description: "El usuario ha sido agregado al chat exitosamente"
      });
      
      return true;
    } catch (error) {
      console.error('Error adding participant:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar el participante"
      });
      return false;
    }
  };

  // Create a new private chat
  const createPrivateChat = async (userId: string): Promise<ChatType | undefined> => {
    if (!currentUser) return undefined;
    
    // Check if a chat already exists with this user
    const existingChat = findExistingPrivateChat(userId);
    if (existingChat) {
      setActiveChat(existingChat);
      return existingChat;
    }
    
    try {
      const newChat = await chatService.createPrivateChat(userId);
      console.log("Created new private chat:", newChat);
      
      if (newChat) {
        // Add the new chat to the state
        setChats(prev => {
          // Make sure we're not adding duplicate chats
          const exists = prev.some(chat => chat.id === newChat.id);
          if (exists) return prev;
          return [...prev, newChat];
        });
        
        // Set as active chat
        setActiveChat(newChat);
        
        toast({
          title: "Chat creado",
          description: "Se ha iniciado un nuevo chat privado"
        });
      }
      
      // Reload all chats to make sure we have the latest data
      await loadChats();
      
      return newChat;
    } catch (error) {
      console.error('Error creating private chat:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el chat privado"
      });
      return undefined;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        createChat,
        createPrivateChat,
        sendMessage,
        deleteChat,
        setActiveChat,
        markAsRead,
        getMessages,
        findExistingPrivateChat,
        activeChat,
        chats,
        onlineUsers,
        loadingChats,
        addParticipantToChat,
        loadChats
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
