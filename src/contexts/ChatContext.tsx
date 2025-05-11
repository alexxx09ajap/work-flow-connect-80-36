import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { chatService, messageService, socketService } from '@/services/api';
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

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

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
      // Load chats from backend
      const chatsData = await chatService.getChats();
      
      // Transform backend chat data to match our frontend ChatType
      const transformedChats: ChatType[] = chatsData.map((chat: any) => ({
        id: chat.id.toString(),
        name: chat.name || '',
        isGroup: chat.is_group_chat,
        participants: chat.participants.map((p: any) => p.id.toString()),
        messages: [],
        lastMessage: chat.lastMessage ? {
          id: chat.lastMessage.id.toString(),
          senderId: chat.lastMessage.sender_id.toString(),
          content: chat.lastMessage.text,
          timestamp: new Date(chat.lastMessage.created_at).getTime()
        } : undefined
      }));
      
      setChats(transformedChats);
    } catch (error) {
      console.error("Error loading chats:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load chats. Please try again."
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
   * Effect to setup socket.io event listeners
   */
  useEffect(() => {
    const socket = socketService.socket;
    if (!socket || !currentUser) return;
    
    // Listen for online users update
    socket.on('userStatusChanged', ({ userId, status }: { userId: string, status: string }) => {
      setOnlineUsers(prev => {
        if (status === 'online' && !prev.includes(userId)) {
          return [...prev, userId];
        } else if (status === 'offline') {
          return prev.filter(id => id !== userId);
        }
        return prev;
      });
    });
    
    // Listen for new messages
    socket.on('message', (message: any) => {
      // Transform backend message to frontend format
      const transformedMessage = {
        id: message.id.toString(),
        senderId: message.sender_id.toString(),
        content: message.text,
        timestamp: new Date(message.created_at).getTime()
      };
      
      // Update chats with new message
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id !== message.chat_id.toString()) return chat;
        
        return {
          ...chat,
          messages: [...chat.messages, transformedMessage],
          lastMessage: transformedMessage
        };
      }));
      
      // If the chat is active, update its messages
      if (activeChat && activeChat.id === message.chat_id.toString()) {
        setActiveChat(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, transformedMessage],
            lastMessage: transformedMessage
          };
        });
      }
    });
    
    // Listen for new chats
    socket.on('newChatCreated', (chat: any) => {
      const transformedChat: ChatType = {
        id: chat.id.toString(),
        name: chat.name || '',
        isGroup: chat.is_group_chat,
        participants: chat.participants.map((p: any) => p.id.toString()),
        messages: [],
        lastMessage: undefined
      };
      
      setChats(prev => [...prev, transformedChat]);
    });
    
    // Listen for chat updates
    socket.on('chatUpdated', (chat: any) => {
      const transformedChat: ChatType = {
        id: chat.id.toString(),
        name: chat.name || '',
        isGroup: chat.is_group_chat,
        participants: chat.participants.map((p: any) => p.id.toString()),
        messages: [], // We'll load messages separately when needed
        lastMessage: chat.lastMessage ? {
          id: chat.lastMessage.id.toString(),
          senderId: chat.lastMessage.sender_id.toString(),
          content: chat.lastMessage.text,
          timestamp: new Date(chat.lastMessage.created_at).getTime()
        } : undefined
      };
      
      setChats(prev => 
        prev.map(c => c.id === transformedChat.id ? transformedChat : c)
      );
      
      // If this is the active chat, update it
      if (activeChat && activeChat.id === transformedChat.id) {
        // Keep the messages from the active chat
        setActiveChat({
          ...transformedChat,
          messages: activeChat.messages
        });
      }
    });
    
    // Listen for chat deletion
    socket.on('chatDeleted', (chatId: string) => {
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // If this was the active chat, clear it
      if (activeChat && activeChat.id === chatId) {
        setActiveChat(null);
      }
    });
    
    return () => {
      socket.off('userStatusChanged');
      socket.off('message');
      socket.off('newChatCreated');
      socket.off('chatUpdated');
      socket.off('chatDeleted');
    };
  }, [currentUser, activeChat, socketService.socket]);

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
      // Send message to backend
      const message = await messageService.sendMessage(chatId, content);
      
      // Transform backend message to frontend format
      const transformedMessage: MessageType = {
        id: message.id.toString(),
        senderId: message.sender_id.toString(),
        content: message.text,
        timestamp: new Date(message.created_at).getTime()
      };
      
      // Update local state
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id !== chatId) return chat;
        
        return {
          ...chat,
          messages: [...chat.messages, transformedMessage],
          lastMessage: transformedMessage
        };
      }));
      
      // If the chat is active, update its messages
      if (activeChat && activeChat.id === chatId) {
        setActiveChat(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, transformedMessage],
            lastMessage: transformedMessage
          };
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send message. Please try again."
      });
    }
  };

  /**
   * Function to create a chat (can be group or 1:1)
   */
  const createChat = async (participantIds: string[], name = '') => {
    if (!currentUser) return;
    
    try {
      let newChat;
      
      if (name || participantIds.length > 1) {
        // Create group chat
        newChat = await chatService.createGroupChat(name, participantIds);
      } else {
        // Create private chat
        newChat = await chatService.createPrivateChat(participantIds[0]);
      }
      
      // Transform backend chat to frontend format
      const transformedChat: ChatType = {
        id: newChat.id.toString(),
        name: newChat.name || '',
        isGroup: newChat.is_group_chat,
        participants: newChat.participants.map((p: any) => p.id.toString()),
        messages: [],
        lastMessage: undefined
      };
      
      // Update chats
      setChats(prev => [...prev, transformedChat]);
      
      // Set the new chat as active
      setActiveChat(transformedChat);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create chat. Please try again."
      });
    }
  };

  /**
   * Enhanced function to create or navigate to an existing private chat
   */
  const createPrivateChat = async (participantId: string) => {
    if (!currentUser || participantId === currentUser.id) return;
    
    try {
      // Check if chat already exists
      const existingChat = findExistingPrivateChat(participantId);
      
      if (existingChat) {
        // If chat exists, set it as active
        setActiveChat(existingChat);
        return;
      }
      
      // Create new private chat
      await createChat([participantId]);
    } catch (error) {
      console.error("Error creating private chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create private chat. Please try again."
      });
    }
  };

  /**
   * Function to add participants to an existing chat
   */
  const addParticipantToChat = async (chatId: string, participantId: string) => {
    try {
      // Add participant to chat
      const updatedChat = await chatService.addUsersToChat(chatId, [participantId]);
      
      // Update local state
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id !== chatId) return chat;
        
        return {
          ...chat,
          participants: updatedChat.participants.map((p: any) => p.id.toString())
        };
      }));
      
      return true;
    } catch (error) {
      console.error("Error adding participant:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add participant. Please try again."
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
