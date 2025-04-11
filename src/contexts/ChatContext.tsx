import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  getChats as getFirebaseChats,
  createChat as createFirebaseChat,
  sendMessage as sendFirebaseMessage,
  addParticipantToChat as addFirebaseParticipantToChat
} from '@/lib/firebaseUtils';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc 
} from "firebase/firestore";
import { db } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';

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
  createPrivateChat: (participantId: string) => Promise<void>;
  getChat: (chatId: string) => ChatType | undefined;
  loadingChats: boolean;
  onlineUsers: string[]; // IDs de usuarios online
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
  const [unsubscribers, setUnsubscribers] = useState<(() => void)[]>([]);

  // Función para buscar un chat privado existente con un usuario específico
  const findExistingPrivateChat = (participantId: string): ChatType | undefined => {
    if (!currentUser) return undefined;
    
    return chats.find(
      chat => !chat.isGroup && 
      chat.participants.length === 2 && 
      chat.participants.includes(currentUser.id) && 
      chat.participants.includes(participantId)
    );
  };

  // Función para cargar todos los chats y configurar listeners en tiempo real
  const loadChats = async () => {
    if (!currentUser) {
      setChats([]);
      setLoadingChats(false);
      return;
    }
  
    setLoadingChats(true);
    try {
      console.log("Loading chats for user:", currentUser.id);
      const userChats = await getFirebaseChats(currentUser.id);
      setChats(userChats);
      console.log("Chats loaded:", userChats.length);
      
      // Setup real-time listeners for each chat
      setupChatListeners();
    } catch (error) {
      console.error("Error loading chats:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los chats. Por favor, inténtalo de nuevo."
      });
    } finally {
      setLoadingChats(false);
    }
  };

  // Setup real-time listeners for user's chats
  const setupChatListeners = () => {
    if (!currentUser) return;
    
    // Clean up any existing listeners
    unsubscribers.forEach(unsubscribe => unsubscribe());
    setUnsubscribers([]);
    
    // Create a query for chats where the current user is a participant
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.id)
    );
    
    // Create a real-time listener
    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const updatedChats: ChatType[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Get the last message if there are messages
        let lastMessage = null;
        if (data.messages && data.messages.length > 0) {
          lastMessage = data.messages[data.messages.length - 1];
        }
        
        updatedChats.push({
          id: doc.id,
          name: data.name || "",
          participants: data.participants || [],
          messages: data.messages || [],
          isGroup: data.isGroup || false,
          lastMessage
        });
      });
      
      console.log("Real-time chat update:", updatedChats.length);
      setChats(updatedChats);
      
      // Update active chat if needed
      if (activeChat) {
        const updatedActiveChat = updatedChats.find(chat => chat.id === activeChat.id);
        if (updatedActiveChat) {
          setActiveChat(updatedActiveChat);
        }
      }
    }, (error) => {
      console.error("Error in chat listener:", error);
    });
    
    setUnsubscribers([unsubscribe]);
    return unsubscribe;
  };

  // Load chats when user changes and set up refresh interval
  useEffect(() => {
    loadChats();
    
    // Set up a refresh interval for real-time updates
    const refreshInterval = setInterval(() => {
      if (currentUser) {
        console.log("Auto refresh: checking for new messages");
        // We don't need to call loadChats() again because the onSnapshot listener
        // will automatically update when new messages arrive.
        // This is just to ensure the connection is still active
      }
    }, 30000); // Check connection every 30 seconds
    
    // Cleanup function to unsubscribe from all listeners and clear interval
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
      clearInterval(refreshInterval);
    };
  }, [currentUser]);

  const getChat = (chatId: string) => {
    return chats.find(chat => chat.id === chatId);
  };

  const sendMessage = async (chatId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    
    try {
      console.log("Sending message:", { chatId, content });
      const newMessage = await sendFirebaseMessage(chatId, currentUser.id, content);
      
      console.log("Message sent successfully:", newMessage);
      // Note: The message will be updated through the real-time listener
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje. Por favor, inténtalo de nuevo."
      });
    }
  };

  // Function to create a regular chat (can be group or 1:1)
  const createChat = async (participantIds: string[], name = '') => {
    if (!currentUser) return;
    
    // Verify that the user current is included
    if (!participantIds.includes(currentUser.id)) {
      participantIds.push(currentUser.id);
    }
    
    try {
      const newChat = await createFirebaseChat(participantIds, name);
      console.log("New chat created:", newChat);
      
      // The new chat will be added through the real-time listener
      setActiveChat(newChat);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el chat. Por favor, inténtalo de nuevo."
      });
    }
  };

  // Función para crear o navegar a un chat privado existente
  const createPrivateChat = async (participantId: string) => {
    if (!currentUser || participantId === currentUser.id) return;
    
    try {
      // Buscar si ya existe un chat privado con este usuario
      const existingChat = findExistingPrivateChat(participantId);
      
      if (existingChat) {
        // Si el chat existe, establecerlo como activo
        console.log("Chat privado existente encontrado, navegando a él:", existingChat.id);
        setActiveChat(existingChat);
        return;
      }
      
      // Si no existe, crear un nuevo chat privado
      console.log("Creando nuevo chat privado con usuario:", participantId);
      const participants = [currentUser.id, participantId];
      const newChat = await createFirebaseChat(participants);
      console.log("New private chat created:", newChat);
      
      // Chat will be added through the real-time listener
      setActiveChat(newChat);
    } catch (error) {
      console.error("Error creating private chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el chat privado. Por favor, inténtalo de nuevo."
      });
    }
  };

  // New function to add participants to an existing chat
  const addParticipantToChat = async (chatId: string, participantId: string) => {
    try {
      // Check if the chat exists and is a group chat
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return false;
      
      // Check if user is already in the chat
      if (chat.participants.includes(participantId)) return false;
      
      // Add participant to Firebase
      await addFirebaseParticipantToChat(chatId, participantId);
      console.log(`Participant ${participantId} added to chat ${chatId}`);
      
      // The chat will be updated through the real-time listener
      return true;
    } catch (error) {
      console.error("Error adding participant:", error);
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
