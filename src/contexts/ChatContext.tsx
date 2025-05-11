
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { MOCK_CHATS } from '@/lib/mockData';
import { toast } from '@/components/ui/use-toast';

// Type definitions for messages and chats
export type MessageType = {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
};

export type ChatType = {
  id: string;
  name: string; // For group chats
  participants: string[]; // User IDs
  messages: MessageType[];
  isGroup: boolean;
  lastMessage?: MessageType;
};

// Chat context interface defining available functions and state
interface ChatContextType {
  chats: ChatType[];
  activeChat: ChatType | null;
  setActiveChat: (chat: ChatType | null) => void;
  sendMessage: (chatId: string, content: string) => void;
  createChat: (participantIds: string[], name?: string) => void;
  createPrivateChat: (participantId: string) => Promise<void>;
  getChat: (chatId: string) => ChatType | undefined;
  loadingChats: boolean;
  onlineUsers: string[]; // Online user IDs
  loadChats: () => Promise<void>;
  addParticipantToChat: (chatId: string, participantId: string) => Promise<boolean>;
  findExistingPrivateChat: (participantId: string) => ChatType | undefined;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Mock online users
const MOCK_ONLINE_USERS = ['1', '2', '3'];

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [onlineUsers] = useState<string[]>(MOCK_ONLINE_USERS);

  /**
   * Function to find an existing private chat with a specific user
   * Used to prevent duplicate chat creation
   */
  const findExistingPrivateChat = (participantId: string): ChatType | undefined => {
    if (!currentUser) return undefined;
    
    return chats.find(
      chat => !chat.isGroup && 
      chat.participants.length === 2 && 
      chat.participants.includes(currentUser.id) && 
      chat.participants.includes(participantId)
    );
  };

  /**
   * Function to load all chats
   */
  const loadChats = async () => {
    if (!currentUser) {
      setChats([]);
      setLoadingChats(false);
      return;
    }
  
    setLoadingChats(true);
    try {
      // Simulamos un retardo para la carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filtramos los chats donde el usuario actual es participante
      const userChats = MOCK_CHATS.filter(chat => 
        chat.participants.includes(currentUser.id)
      );
      
      setChats(userChats);
    } catch (error) {
      console.error("Error al cargar chats:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los chats. Por favor, inténtalo de nuevo."
      });
    } finally {
      setLoadingChats(false);
    }
  };

  /**
   * Effect to load chats when the user changes
   */
  useEffect(() => {
    loadChats();
  }, [currentUser]);

  /**
   * Helper function to get a specific chat by ID
   */
  const getChat = (chatId: string) => {
    return chats.find(chat => chat.id === chatId);
  };

  /**
   * Function to send messages
   */
  const sendMessage = async (chatId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    
    try {
      // Simulamos un retardo para el envío
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newMessage: MessageType = {
        id: `msg_${Date.now()}`,
        senderId: currentUser.id,
        content,
        timestamp: Date.now()
      };
      
      // Actualizamos el estado local
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id !== chatId) return chat;
        
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: newMessage
        };
      }));
      
      // En un caso real, esto actualizaría la base de datos
      const mockChatIndex = MOCK_CHATS.findIndex(chat => chat.id === chatId);
      if (mockChatIndex !== -1) {
        MOCK_CHATS[mockChatIndex].messages.push(newMessage);
        MOCK_CHATS[mockChatIndex].lastMessage = newMessage;
      }
      
      // Si el chat activo es el mismo, actualizamos sus mensajes
      if (activeChat && activeChat.id === chatId) {
        setActiveChat(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, newMessage],
            lastMessage: newMessage
          };
        });
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje. Por favor, inténtalo de nuevo."
      });
    }
  };

  /**
   * Function to create a chat (can be group or 1:1)
   */
  const createChat = async (participantIds: string[], name = '') => {
    if (!currentUser) return;
    
    // Ensure current user is included
    if (!participantIds.includes(currentUser.id)) {
      participantIds.push(currentUser.id);
    }
    
    try {
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const isGroup = participantIds.length > 2 || !!name;
      
      const newChat: ChatType = {
        id: `chat_${Date.now()}`,
        name,
        participants: participantIds,
        messages: [],
        isGroup
      };
      
      // Actualizamos el estado local
      setChats(prevChats => [...prevChats, newChat]);
      
      // En un caso real, esto actualizaría la base de datos
      MOCK_CHATS.push(newChat);
      
      // Establecemos el chat como activo
      setActiveChat(newChat);
    } catch (error) {
      console.error("Error al crear chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el chat. Por favor, inténtalo de nuevo."
      });
    }
  };

  /**
   * Enhanced function to create or navigate to an existing private chat
   */
  const createPrivateChat = async (participantId: string) => {
    if (!currentUser || participantId === currentUser.id) return;
    
    try {
      // Check if a private chat already exists with this user
      const existingChat = findExistingPrivateChat(participantId);
      
      if (existingChat) {
        // If the chat exists, set it as active
        setActiveChat(existingChat);
        return;
      }
      
      // If it doesn't exist, create a new private chat
      await createChat([currentUser.id, participantId]);
    } catch (error) {
      console.error("Error al crear chat privado:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el chat privado. Por favor, inténtalo de nuevo."
      });
    }
  };

  /**
   * Function to add participants to an existing chat
   */
  const addParticipantToChat = async (chatId: string, participantId: string) => {
    try {
      // Check if the chat exists
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return false;
      
      // Check if the user is already in the chat
      if (chat.participants.includes(participantId)) return false;
      
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mensaje del sistema
      const systemMessage: MessageType = {
        id: `msg_${Date.now()}`,
        senderId: "system",
        content: "Un nuevo participante se ha unido al chat",
        timestamp: Date.now()
      };
      
      // Actualizamos el estado local
      setChats(prevChats => prevChats.map(c => {
        if (c.id !== chatId) return c;
        
        return {
          ...c,
          participants: [...c.participants, participantId],
          messages: [...c.messages, systemMessage],
          lastMessage: systemMessage
        };
      }));
      
      // En un caso real, esto actualizaría la base de datos
      const mockChatIndex = MOCK_CHATS.findIndex(c => c.id === chatId);
      if (mockChatIndex !== -1) {
        MOCK_CHATS[mockChatIndex].participants.push(participantId);
        MOCK_CHATS[mockChatIndex].messages.push(systemMessage);
        MOCK_CHATS[mockChatIndex].lastMessage = systemMessage;
      }
      
      return true;
    } catch (error) {
      console.error("Error al añadir participante:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo añadir el participante. Por favor, inténtalo de nuevo."
      });
      return false;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        setActiveChat,
        sendMessage,
        createChat,
        createPrivateChat,
        getChat,
        loadingChats,
        onlineUsers,
        loadChats,
        addParticipantToChat,
        findExistingPrivateChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
