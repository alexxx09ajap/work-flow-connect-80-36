
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
const MOCK_ONLINE_USERS = ['1', '2', '3'];

// Mock de chats iniciales con conversación más detallada
const INITIAL_CHATS: ChatType[] = [
  {
    id: '1',
    name: 'Proyecto Web App',
    participants: ['1', '2', '3'],
    messages: [
      {
        id: '1',
        senderId: '1',
        content: 'Hola equipo, ¿cómo va el desarrollo de la aplicación?',
        timestamp: Date.now() - 86400000 // 1 día atrás
      },
      {
        id: '2',
        senderId: '2',
        content: 'Bien, estoy terminando las últimas funcionalidades del dashboard',
        timestamp: Date.now() - 82800000
      },
      {
        id: '3',
        senderId: '3',
        content: 'Yo estoy trabajando en el diseño de la interfaz móvil. Tengo algunas dudas sobre los colores que debemos usar.',
        timestamp: Date.now() - 79200000
      },
      {
        id: '4',
        senderId: '1',
        content: 'Podemos seguir la guía de estilo que acordamos. Los colores principales son el morado #9b87f5 y sus variaciones.',
        timestamp: Date.now() - 75600000
      },
      {
        id: '5',
        senderId: '2',
        content: '¿Cuándo es la próxima reunión con el cliente para mostrar el avance?',
        timestamp: Date.now() - 72000000
      },
      {
        id: '6',
        senderId: '1',
        content: 'La reunión está programada para el próximo viernes a las 10am. Por favor, preparen sus demostraciones para ese día.',
        timestamp: Date.now() - 68400000
      },
      {
        id: '7',
        senderId: '3',
        content: 'Perfecto, tendré lista la presentación del diseño para entonces.',
        timestamp: Date.now() - 64800000
      },
      {
        id: '8',
        senderId: '2',
        content: 'Yo también tendré lista la demo de las funcionalidades principales.',
        timestamp: Date.now() - 61200000
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
        content: 'Hola, vi tu propuesta para el proyecto de e-commerce, me interesa mucho.',
        timestamp: Date.now() - 172800000 // 2 días atrás
      },
      {
        id: '2',
        senderId: '1',
        content: '¡Qué bueno! ¿Tienes alguna pregunta específica sobre la implementación?',
        timestamp: Date.now() - 169200000
      },
      {
        id: '3',
        senderId: '2',
        content: 'Sí, me gustaría saber más sobre la integración con sistemas de pago como Stripe o PayPal.',
        timestamp: Date.now() - 165600000
      },
      {
        id: '4',
        senderId: '1',
        content: 'Claro, podemos implementar ambos. Stripe es más sencillo para integrar y tiene comisiones más bajas, pero PayPal tiene más alcance en Latinoamérica.',
        timestamp: Date.now() - 162000000
      },
      {
        id: '5',
        senderId: '2',
        content: 'Entiendo. Creo que lo mejor sería implementar ambos para dar opciones a los usuarios.',
        timestamp: Date.now() - 158400000
      },
      {
        id: '6',
        senderId: '1',
        content: 'De acuerdo. También podemos agregar MercadoPago si tienes clientes en Latinoamérica.',
        timestamp: Date.now() - 154800000
      },
      {
        id: '7',
        senderId: '2',
        content: '¡Excelente idea! ¿Podemos coordinar una llamada para discutir más detalles?',
        timestamp: Date.now() - 151200000
      }
    ],
    isGroup: false
  },
  {
    id: '3',
    name: 'Soporte Técnico',
    participants: ['1', '3'],
    messages: [
      {
        id: '1',
        senderId: '3',
        content: 'Tengo un problema con la instalación del software. Me aparece un error 404.',
        timestamp: Date.now() - 259200000 // 3 días atrás
      },
      {
        id: '2',
        senderId: '1',
        content: '¿Podrías enviarme una captura de pantalla del error?',
        timestamp: Date.now() - 255600000
      },
      {
        id: '3',
        senderId: '3',
        content: 'Claro, aquí está: [Imagen de error]',
        timestamp: Date.now() - 252000000
      },
      {
        id: '4',
        senderId: '1',
        content: 'Gracias. Parece que estás intentando acceder a un recurso que no existe. ¿Estás usando la última versión?',
        timestamp: Date.now() - 248400000
      },
      {
        id: '5',
        senderId: '3',
        content: 'Déjame verificar... estoy usando la versión 2.1.0',
        timestamp: Date.now() - 244800000
      },
      {
        id: '6',
        senderId: '1',
        content: 'Ese es el problema. La última versión es la 2.3.5. Te recomiendo actualizar para resolver el error.',
        timestamp: Date.now() - 241200000
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
