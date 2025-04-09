
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  getChats as getFirebaseChats,
  createChat as createFirebaseChat,
  sendMessage as sendFirebaseMessage
} from '@/lib/firebaseUtils';

export type MessageType = {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
};

export type ChatType = {
  id: string;
  name: string; // Para chats grupales
  participants: string[]; // IDs de los usuarios
  messages: MessageType[];
  isGroup: boolean;
  lastMessage?: MessageType;
};

interface ChatContextType {
  chats: ChatType[];
  activeChat: ChatType | null;
  setActiveChat: (chat: ChatType | null) => void;
  sendMessage: (chatId: string, content: string) => void;
  createChat: (participantIds: string[], name?: string) => void;
  getChat: (chatId: string) => ChatType | undefined;
  loadingChats: boolean;
  onlineUsers: string[]; // IDs de usuarios online
  loadChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Mock online users - in a real app this would come from a presence system
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

  const loadChats = async () => {
    if (!currentUser) {
      setChats([]);
      setLoadingChats(false);
      return;
    }
  
    setLoadingChats(true);
    try {
      const userChats = await getFirebaseChats(currentUser.id);
      setChats(userChats);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  // Load chats when user changes
  useEffect(() => {
    loadChats();
  }, [currentUser]);

  const getChat = (chatId: string) => {
    return chats.find(chat => chat.id === chatId);
  };

  const sendMessage = async (chatId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    
    try {
      const newMessage = await sendFirebaseMessage(chatId, currentUser.id, content);
      
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage
            };
          }
          return chat;
        });
      });
      
      // If the active chat is the one we're sending a message to, update it
      if (activeChat?.id === chatId) {
        setActiveChat(prevChat => {
          if (!prevChat) return null;
          return {
            ...prevChat,
            messages: [...prevChat.messages, newMessage],
            lastMessage: newMessage
          };
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const createChat = async (participantIds: string[], name = '') => {
    if (!currentUser) return;
    
    // Verify that the user current is included
    if (!participantIds.includes(currentUser.id)) {
      participantIds.push(currentUser.id);
    }
    
    try {
      const newChat = await createFirebaseChat(participantIds, name);
      
      setChats(prevChats => [...prevChats, newChat]);
      setActiveChat(newChat);
    } catch (error) {
      console.error("Error creating chat:", error);
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
        getChat,
        loadingChats,
        onlineUsers,
        loadChats
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
