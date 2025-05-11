import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ChatType, MessageType, UserType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import io, { Socket } from 'socket.io-client';

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
  loadChats: () => void;
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

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  // Load user's chats
  const loadChats = async () => {
    if (!currentUser) return;
    
    setLoadingChats(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/chats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error loading chats');
      }
      
      const data = await response.json();
      setChats(data);
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
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participants: participantIds,
          name: name || '',
          isGroup: participantIds.length > 1
        })
      });
      
      if (!response.ok) {
        throw new Error('Error creating chat');
      }
      
      const newChat = await response.json();
      
      setChats((prev) => [...prev, newChat]);
      
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
      !chat.isGroup && chat.participants.includes(userId) && chat.participants.includes(currentUser.id)
    );
  };

  // Send a message
  const sendMessage = async (chatId: string, content: string) => {
    if (!currentUser || !socket) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chatId,
          content
        })
      });
      
      if (!response.ok) {
        throw new Error('Error sending message');
      }
      
      // No need to handle the response here as the socket will emit a chat:message event
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
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/chats/${chatId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error marking messages as read');
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Delete a chat
  const deleteChat = async (chatId: string) => {
    if (!currentUser) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error deleting chat');
      }
      
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
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/chats/${chatId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error('Error adding participant');
      }
      
      // Update chat in state
      loadChats();
      
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
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participants: [userId],
          isGroup: false
        })
      });
      
      if (!response.ok) {
        throw new Error('Error creating chat');
      }
      
      const newChat = await response.json();
      
      // Make sure the new chat has a messages array
      const chatWithMessages = {
        ...newChat,
        messages: []
      };
      
      setChats(prev => [...prev, chatWithMessages]);
      setActiveChat(chatWithMessages);
      
      return chatWithMessages;
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
