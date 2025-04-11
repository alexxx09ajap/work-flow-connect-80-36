
/**
 * Chat Context Provider
 * 
 * This file manages all the chat functionality including:
 * - Real-time chat synchronization using Firebase listeners
 * - Sending and receiving messages
 * - Creating new chats
 * - Managing active chat state
 * 
 * The real-time functionality is implemented using Firebase's onSnapshot listeners
 * which act similarly to WebSockets by pushing updates to connected clients.
 */

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
   * Function to load all chats and set up real-time listeners
   * This is the main function that initializes the real-time chat functionality
   */
  const loadChats = async () => {
    if (!currentUser) {
      setChats([]);
      setLoadingChats(false);
      return;
    }
  
    setLoadingChats(true);
    try {
      console.log("Cargando chats para el usuario:", currentUser.id);
      const userChats = await getFirebaseChats(currentUser.id);
      setChats(userChats);
      console.log("Chats cargados:", userChats.length);
      
      // Setting up real-time listeners for each chat
      setupChatListeners();
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
   * Key function for real-time updates
   * Sets up Firebase onSnapshot listeners to react to any changes in the chat documents
   * This replaces the need for traditional websockets/Socket.io
   */
  const setupChatListeners = () => {
    if (!currentUser) return;
    
    // Clear existing listeners to avoid duplicates
    unsubscribers.forEach(unsubscribe => unsubscribe());
    setUnsubscribers([]);
    
    // Create a query for chats where the current user is a participant
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.id)
    );
    
    // Create a real-time listener with onSnapshot
    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      console.log("Actualización en tiempo real de chats recibida");
      
      // Process changes to the chat collection
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
      
      console.log("Actualización en tiempo real:", updatedChats.length, "chats");
      setChats(updatedChats);
      
      // IMPORTANT: Key improvement - update active chat after each change for real-time updates within a conversation
      if (activeChat) {
        const updatedActiveChat = updatedChats.find(chat => chat.id === activeChat.id);
        if (updatedActiveChat) {
          console.log("Actualizando chat activo con nuevos mensajes en tiempo real");
          setActiveChat(updatedActiveChat);
        }
      }
    }, (error) => {
      console.error("Error en el listener de chats:", error);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "Ha ocurrido un problema con la conexión en tiempo real. Intenta recargar la página."
      });
    });
    
    setUnsubscribers([unsubscribe]);
    console.log("Listener en tiempo real configurado correctamente");
    return unsubscribe;
  };

  /**
   * Effect to monitor changes in activeChat and ensure it stays updated
   * This is crucial for real-time messaging within an open chat
   */
  useEffect(() => {
    if (activeChat && chats.length > 0) {
      // Find the most up-to-date version of the active chat in the chats array
      const refreshedChat = chats.find(chat => chat.id === activeChat.id);
      if (refreshedChat && JSON.stringify(refreshedChat) !== JSON.stringify(activeChat)) {
        console.log("Actualizando chat activo con datos más recientes");
        setActiveChat(refreshedChat);
      }
    }
  }, [chats]);

  /**
   * Set up and clean up listeners when the user changes
   */
  useEffect(() => {
    console.log("Usuario cambiado, configurando listeners...");
    loadChats();
    
    // Cleanup function for when component unmounts
    return () => {
      console.log("Limpiando listeners de chat");
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [currentUser]);

  /**
   * Helper function to get a specific chat by ID
   */
  const getChat = (chatId: string) => {
    return chats.find(chat => chat.id === chatId);
  };

  /**
   * Function to send messages with real-time updates
   */
  const sendMessage = async (chatId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    
    try {
      console.log("Enviando mensaje:", { chatId, content });
      const newMessage = await sendFirebaseMessage(chatId, currentUser.id, content);
      console.log("Mensaje enviado correctamente:", newMessage);
      
      // The onSnapshot listener will detect the change and update the state
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
      const newChat = await createFirebaseChat(participantIds, name);
      console.log("Nuevo chat creado:", newChat);
      
      // The new chat will be added through the real-time listener
      // However, update the active chat immediately
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
        console.log("Chat privado existente encontrado, navegando a él:", existingChat.id);
        setActiveChat(existingChat);
        return;
      }
      
      // If it doesn't exist, create a new private chat
      console.log("Creando nuevo chat privado con usuario:", participantId);
      const participants = [currentUser.id, participantId];
      const newChat = await createFirebaseChat(participants);
      console.log("Nuevo chat privado creado:", newChat);
      
      // The chat will be added through the real-time listener
      setActiveChat(newChat);
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
      // Check if the chat exists and is a group chat
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return false;
      
      // Check if the user is already in the chat
      if (chat.participants.includes(participantId)) return false;
      
      // Add participant to Firebase
      await addFirebaseParticipantToChat(chatId, participantId);
      console.log(`Participante ${participantId} añadido al chat ${chatId}`);
      
      // The chat will be updated through the real-time listener
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
