
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth, UserType } from './AuthContext';

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
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Mock de usuarios para desarrollo
const MOCK_ONLINE_USERS = ['1', '2'];

// Mock de chats iniciales
const INITIAL_CHATS: ChatType[] = [
  {
    id: '1',
    name: 'Proyecto Web App',
    participants: ['1', '2'],
    messages: [
      {
        id: '1',
        senderId: '1',
        content: 'Hola, ¿cómo va el proyecto?',
        timestamp: Date.now() - 3600000
      },
      {
        id: '2',
        senderId: '2',
        content: 'Bien, estoy terminando las últimas funcionalidades',
        timestamp: Date.now() - 3500000
      }
    ],
    isGroup: true
  },
  {
    id: '2',
    name: '',
    participants: ['1', '2'],
    messages: [
      {
        id: '1',
        senderId: '2',
        content: 'Hola, vi tu propuesta, me interesa',
        timestamp: Date.now() - 86400000
      }
    ],
    isGroup: false
  }
];

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [onlineUsers] = useState<string[]>(MOCK_ONLINE_USERS);

  // Cargar chats al iniciar
  useEffect(() => {
    if (currentUser) {
      // En un caso real, aquí cargaríamos los chats del usuario desde Firebase
      const userChats = INITIAL_CHATS.filter(chat => 
        chat.participants.includes(currentUser.id)
      );
      
      // Añadir la referencia al último mensaje para la vista previa
      const chatsWithLastMessage = userChats.map(chat => ({
        ...chat,
        lastMessage: chat.messages[chat.messages.length - 1]
      }));
      
      setChats(chatsWithLastMessage);
    } else {
      setChats([]);
    }
    setLoadingChats(false);
  }, [currentUser]);

  const getChat = (chatId: string) => {
    return chats.find(chat => chat.id === chatId);
  };

  const sendMessage = (chatId: string, content: string) => {
    if (!currentUser) return;
    
    const newMessage: MessageType = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      content,
      timestamp: Date.now()
    };
    
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
    
    // En un caso real, aquí enviaríamos el mensaje a Firebase y notificaríamos con Socket.io
  };

  const createChat = (participantIds: string[], name = '') => {
    if (!currentUser) return;
    
    // Verificar que el usuario actual esté incluido
    if (!participantIds.includes(currentUser.id)) {
      participantIds.push(currentUser.id);
    }
    
    const newChat: ChatType = {
      id: `chat_${Date.now()}`,
      name,
      participants: participantIds,
      messages: [],
      isGroup: participantIds.length > 2 || !!name,
    };
    
    setChats(prevChats => [...prevChats, newChat]);
    setActiveChat(newChat);
    
    // En un caso real, aquí crearíamos el chat en Firebase
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
        onlineUsers
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
