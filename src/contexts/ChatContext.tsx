
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
      console.log("Cargando chats para el usuario:", currentUser.id);
      const userChats = await getFirebaseChats(currentUser.id);
      setChats(userChats);
      console.log("Chats cargados:", userChats.length);
      
      // Configuración de los listeners en tiempo real para cada chat
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

  // Mejorada: configuración de listeners en tiempo real para los chats del usuario
  const setupChatListeners = () => {
    if (!currentUser) return;
    
    // Limpiar listeners existentes para evitar duplicados
    unsubscribers.forEach(unsubscribe => unsubscribe());
    setUnsubscribers([]);
    
    // Crear una consulta para los chats donde el usuario actual es participante
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.id)
    );
    
    // Crear un listener en tiempo real con onSnapshot
    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      console.log("Actualización en tiempo real de chats recibida");
      
      // Procesar los cambios en la colección de chats
      const updatedChats: ChatType[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Obtener el último mensaje si hay mensajes
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
      
      // IMPORTANTE: Aquí está la mejora clave - actualizar el chat activo después de cada cambio
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

  // Observar cambios en activeChat y asegurarnos de que se mantenga actualizado
  useEffect(() => {
    if (activeChat && chats.length > 0) {
      // Buscar la versión más actualizada del chat activo en el arreglo de chats
      const refreshedChat = chats.find(chat => chat.id === activeChat.id);
      if (refreshedChat && JSON.stringify(refreshedChat) !== JSON.stringify(activeChat)) {
        console.log("Actualizando chat activo con datos más recientes");
        setActiveChat(refreshedChat);
      }
    }
  }, [chats]);

  // Configurar y limpiar listeners cuando cambia el usuario
  useEffect(() => {
    console.log("Usuario cambiado, configurando listeners...");
    loadChats();
    
    // Función de limpieza para cuando el componente se desmonte
    return () => {
      console.log("Limpiando listeners de chat");
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [currentUser]);

  const getChat = (chatId: string) => {
    return chats.find(chat => chat.id === chatId);
  };

  // Función mejorada para enviar mensajes con actualización en tiempo real
  const sendMessage = async (chatId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    
    try {
      console.log("Enviando mensaje:", { chatId, content });
      const newMessage = await sendFirebaseMessage(chatId, currentUser.id, content);
      console.log("Mensaje enviado correctamente:", newMessage);
      
      // El listener de onSnapshot detectará el cambio y actualizará el estado
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje. Por favor, inténtalo de nuevo."
      });
    }
  };

  // Función para crear un chat normal (puede ser grupo o 1:1)
  const createChat = async (participantIds: string[], name = '') => {
    if (!currentUser) return;
    
    // Verificar que el usuario actual esté incluido
    if (!participantIds.includes(currentUser.id)) {
      participantIds.push(currentUser.id);
    }
    
    try {
      const newChat = await createFirebaseChat(participantIds, name);
      console.log("Nuevo chat creado:", newChat);
      
      // El nuevo chat se añadirá a través del listener en tiempo real
      // Aún así, actualizamos el chat activo inmediatamente
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

  // Función mejorada para crear o navegar a un chat privado existente
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
      console.log("Nuevo chat privado creado:", newChat);
      
      // El chat se añadirá a través del listener en tiempo real
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

  // Función para añadir participantes a un chat existente
  const addParticipantToChat = async (chatId: string, participantId: string) => {
    try {
      // Verificar si el chat existe y es un chat grupal
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return false;
      
      // Verificar si el usuario ya está en el chat
      if (chat.participants.includes(participantId)) return false;
      
      // Añadir participante a Firebase
      await addFirebaseParticipantToChat(chatId, participantId);
      console.log(`Participante ${participantId} añadido al chat ${chatId}`);
      
      // El chat se actualizará a través del listener en tiempo real
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
