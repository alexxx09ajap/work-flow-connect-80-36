
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { Chat, Message, User } from '@/types';
import { useAuth } from './AuthContext';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/components/ui/use-toast';

// Chat state
interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  users: User[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: string[]; // Array of message IDs that match the search
}

// Define actions
type ChatAction =
  | { type: 'FETCH_CHATS_START' }
  | { type: 'FETCH_CHATS_SUCCESS'; payload: Chat[] }
  | { type: 'FETCH_CHATS_FAILURE'; payload: string }
  | { type: 'SET_CURRENT_CHAT'; payload: Chat }
  | { type: 'CLEAR_CURRENT_CHAT' }
  | { type: 'FETCH_MESSAGES_START' }
  | { type: 'FETCH_MESSAGES_SUCCESS'; payload: Message[] }
  | { type: 'FETCH_MESSAGES_FAILURE'; payload: string }
  | { type: 'NEW_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE_SUCCESS'; payload: Message }
  | { type: 'UPDATE_MESSAGE_FAILURE'; payload: string }
  | { type: 'DELETE_MESSAGE_SUCCESS'; payload: string }
  | { type: 'DELETE_MESSAGE_FAILURE'; payload: string }
  | { type: 'DELETE_CHAT_SUCCESS'; payload: string }
  | { type: 'DELETE_CHAT_FAILURE'; payload: string }
  | { type: 'FETCH_USERS_SUCCESS'; payload: User[] }
  | { type: 'UPDATE_USER_STATUS'; payload: { userId: string, status: 'online' | 'offline' } }
  | { type: 'CREATE_CHAT_SUCCESS'; payload: Chat }
  | { type: 'UPDATE_CHAT_SUCCESS'; payload: Chat }
  | { type: 'FILE_UPLOAD_START' }
  | { type: 'FILE_UPLOAD_SUCCESS'; payload: Message }
  | { type: 'FILE_UPLOAD_FAILURE'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: string[] }
  | { type: 'LEAVE_GROUP_SUCCESS'; payload: string }
  | { type: 'LEAVE_GROUP_FAILURE'; payload: string }
  | { type: 'NEW_CHAT_RECEIVED'; payload: Chat };

// Initial state
const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  users: [],
  loading: false,
  error: null,
  searchQuery: '',
  searchResults: [],
};

// Reducer to update state
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'FETCH_CHATS_START':
    case 'FETCH_MESSAGES_START':
    case 'FILE_UPLOAD_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_CHATS_SUCCESS':
      return {
        ...state,
        chats: action.payload,
        loading: false,
      };
    case 'FETCH_CHATS_FAILURE':
    case 'FETCH_MESSAGES_FAILURE':
    case 'FILE_UPLOAD_FAILURE':
    case 'DELETE_MESSAGE_FAILURE':
    case 'DELETE_CHAT_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'SET_CURRENT_CHAT':
      return {
        ...state,
        currentChat: action.payload,
        // Reset search when changing chats
        searchQuery: '',
        searchResults: [],
      };
    case 'CLEAR_CURRENT_CHAT':
      return {
        ...state,
        currentChat: null,
        messages: [],
        searchQuery: '',
        searchResults: [],
      };
    case 'FETCH_MESSAGES_SUCCESS':
      return {
        ...state,
        messages: action.payload,
        loading: false,
      };
    case 'NEW_MESSAGE':
    case 'FILE_UPLOAD_SUCCESS':
      // Check if the message already exists to avoid duplicates
      const messageExists = state.messages.some(msg => msg._id === action.payload._id);
      if (messageExists) {
        return state;
      }
      return {
        ...state,
        messages: [...state.messages, action.payload],
        loading: false,
        chats: state.chats.map(chat => 
          chat._id === action.payload.chatId 
            ? { ...chat, lastMessage: action.payload } 
            : chat
        )
      };
    case 'DELETE_MESSAGE_SUCCESS':
      const deletedMessageId = action.payload;
      const updatedMessages = state.messages.filter(msg => msg._id !== deletedMessageId);
      
      // Update the chat's last message if necessary
      const updatedChats = state.chats.map(chat => {
        if (chat.lastMessage && chat.lastMessage._id === deletedMessageId) {
          // Find the last valid message for this chat after deletion
          const lastChatMessage = updatedMessages
            .filter(msg => msg.chatId === chat._id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          
          return {
            ...chat,
            lastMessage: lastChatMessage || null
          };
        }
        return chat;
      });
      
      // Remove from search results if applicable
      const updatedSearchResults = state.searchResults.filter(id => id !== deletedMessageId);
      
      return {
        ...state,
        messages: updatedMessages,
        chats: updatedChats,
        searchResults: updatedSearchResults,
        loading: false
      };
    case 'DELETE_CHAT_SUCCESS':
      // If the deleted chat is the current chat, clear it
      const isCurrentChatDeleted = state.currentChat?._id === action.payload;
      
      return {
        ...state,
        chats: state.chats.filter(chat => chat._id !== action.payload),
        currentChat: isCurrentChatDeleted ? null : state.currentChat,
        messages: isCurrentChatDeleted ? [] : state.messages,
        searchQuery: isCurrentChatDeleted ? '' : state.searchQuery,
        searchResults: isCurrentChatDeleted ? [] : state.searchResults,
        loading: false
      };
    case 'FETCH_USERS_SUCCESS':
      return {
        ...state,
        users: action.payload,
      };
    case 'UPDATE_USER_STATUS':
      // Update a specific user's status
      const { userId, status } = action.payload;
      
      // Update in the users list
      const updatedUsers = state.users.map(user => 
        user._id === userId ? { ...user, status } : user
      );
      
      // Update in the chats list (participants)
      const updatedChatsList = state.chats.map(chat => {
        const updatedParticipants = chat.participants.map(participant => 
          participant._id === userId ? { ...participant, status } : participant
        );
        
        return { ...chat, participants: updatedParticipants };
      });
      
      // Update in the current chat if it exists
      let updatedCurrentChat = state.currentChat;
      if (updatedCurrentChat) {
        const updatedCurrentChatParticipants = updatedCurrentChat.participants.map(participant => 
          participant._id === userId ? { ...participant, status } : participant
        );
        updatedCurrentChat = { ...updatedCurrentChat, participants: updatedCurrentChatParticipants };
      }
      
      return {
        ...state,
        users: updatedUsers,
        chats: updatedChatsList,
        currentChat: updatedCurrentChat,
      };
    case 'CREATE_CHAT_SUCCESS':
      return {
        ...state,
        chats: [action.payload, ...state.chats],
        currentChat: action.payload,
        searchQuery: '',
        searchResults: [],
      };
    case 'UPDATE_CHAT_SUCCESS':
      return {
        ...state,
        chats: state.chats.map(chat => 
          chat._id === action.payload._id ? action.payload : chat
        ),
        currentChat: state.currentChat?._id === action.payload._id 
          ? action.payload 
          : state.currentChat,
      };
    case 'UPDATE_MESSAGE_SUCCESS':
      const updatedMessagesArray = state.messages.map(msg => 
        msg._id === action.payload._id ? action.payload : msg
      );
      
      // If the message was in search results, check if it still matches
      let newSearchResults = [...state.searchResults];
      if (state.searchQuery && state.searchResults.includes(action.payload._id)) {
        const matches = action.payload.text?.toLowerCase().includes(state.searchQuery.toLowerCase());
        if (!matches) {
          newSearchResults = newSearchResults.filter(id => id !== action.payload._id);
        }
      }
      
      return {
        ...state,
        messages: updatedMessagesArray,
        searchResults: newSearchResults,
        chats: state.chats.map(chat => {
          // If this message is the last message in a chat, update it there too
          if (chat.lastMessage && chat.lastMessage._id === action.payload._id) {
            return {
              ...chat,
              lastMessage: action.payload
            };
          }
          return chat;
        })
      };
    case 'UPDATE_MESSAGE_FAILURE':
      return {
        ...state,
        error: action.payload
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload,
      };
    case 'LEAVE_GROUP_SUCCESS':
      return {
        ...state,
        chats: state.chats.filter(chat => chat._id !== action.payload),
        currentChat: state.currentChat?._id === action.payload ? null : state.currentChat,
        messages: state.currentChat?._id === action.payload ? [] : state.messages,
        loading: false
      };
    case 'LEAVE_GROUP_FAILURE':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'NEW_CHAT_RECEIVED':
      // Check if the chat already exists to avoid duplicates
      const chatExists = state.chats.some(chat => chat._id === action.payload._id);
      if (chatExists) {
        return state;
      }
      return {
        ...state,
        chats: [action.payload, ...state.chats]
      };
    default:
      return state;
  }
};

// Create the context
interface ChatContextType {
  state: ChatState;
  sendMessage: (text: string) => void;
  updateMessage: (messageId: string, newText: string) => Promise<void>;
  deleteMessage: (messageId: string) => void;
  deleteChat: (chatId: string) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  setCurrentChat: (chat: Chat) => void;
  clearCurrentChat: () => void;
  fetchUsers: () => Promise<void>;
  createPrivateChat: (userId: string) => Promise<void>;
  createGroupChat: (name: string, participants: string[]) => Promise<void>;
  addUsersToGroup: (chatId: string, userIds: string[]) => Promise<void>;
  searchMessages: (query: string) => void;
  clearSearch: () => void;
  leaveGroup: (chatId: string) => Promise<void>;
  socket: Socket | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// API Base URL and Socket URL
const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// Context provider
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { state: authState } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const { toast } = useToast();

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.token) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: authState.token
        },
        transports: ['websocket', 'polling'],
        forceNew: true
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [authState.isAuthenticated, authState.token]);

  // Listen to socket events
  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
      });

      socket.on('message', (newMessage: Message) => {
        console.log('Message received:', newMessage);
        dispatch({ type: 'NEW_MESSAGE', payload: newMessage });
        
        // Notify if the message is from a chat that is not the current one
        if (state.currentChat?._id !== newMessage.chatId && authState.user?._id !== newMessage.senderId) {
          const chat = state.chats.find(c => c._id === newMessage.chatId);
          const sender = chat?.participants.find(p => p._id === newMessage.senderId);
          
          toast({
            title: chat?.name || sender?.username || 'New message',
            description: newMessage.fileId ? 'Has sent a file' : newMessage.text,
          });
        }
      });

      // Add listener for new chat creation
      socket.on('newChatCreated', (newChat: Chat) => {
        console.log('New chat received:', newChat);
        dispatch({ type: 'NEW_CHAT_RECEIVED', payload: newChat });
        
        // Show notification for new chat
        const creator = newChat.participants.find(p => p._id !== authState.user?._id);
        
        toast({
          title: newChat.isGroupChat 
            ? `New group: ${newChat.name}`
            : `New chat with ${creator?.username || 'user'}`,
          description: newChat.isGroupChat
            ? 'You have been added to a new group'
            : `${creator?.username || 'A user'} has started a chat with you`,
        });
      });

      socket.on('messageUpdated', (updatedMessage: Message) => {
        console.log('Message updated:', updatedMessage);
        dispatch({ type: 'UPDATE_MESSAGE_SUCCESS', payload: updatedMessage });
      });

      socket.on('messageDeleted', (messageId: string) => {
        console.log('Message deleted:', messageId);
        dispatch({ type: 'DELETE_MESSAGE_SUCCESS', payload: messageId });
      });

      socket.on('chatDeleted', (chatId: string) => {
        console.log('Chat deleted:', chatId);
        dispatch({ type: 'DELETE_CHAT_SUCCESS', payload: chatId });
        
        // If the deleted chat is the current one, show notification
        if (state.currentChat?._id === chatId) {
          toast({
            title: "Chat deleted",
            description: "The chat has been deleted"
          });
        }
      });

      // New event for user status changes
      socket.on('userStatusChanged', (data: { userId: string; status: 'online' | 'offline' }) => {
        console.log('User status changed:', data);
        dispatch({ type: 'UPDATE_USER_STATUS', payload: data });
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
        toast({
          variant: "destructive",
          title: "Connection error",
          description: "Lost connection to the server",
        });
      });

      return () => {
        socket.off('connect');
        socket.off('message');
        socket.off('messageUpdated');
        socket.off('messageDeleted');
        socket.off('chatDeleted');
        socket.off('userStatusChanged');
        socket.off('error');
        socket.off('newChatCreated');
        socket.off('chatUpdated');
      };
    }
  }, [socket, state.currentChat, authState.user, state.chats, toast]);

  // Search messages function
  const searchMessages = (query: string) => {
    if (!query.trim() || !state.messages.length) {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
      return;
    }
    
    const normalizedQuery = query.toLowerCase();
    
    // Find messages that contain the query
    const matchingMessageIds = state.messages
      .filter(message => {
        // Search in text messages
        if (message.text && message.text.toLowerCase().includes(normalizedQuery)) {
          return true;
        }
        return false;
      })
      .map(message => message._id);
    
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: matchingMessageIds });
  };
  
  // Clear search function
  const clearSearch = () => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
  };
  
  // Fetch chats
  const fetchChats = async () => {
    if (!authState.token) return;
    
    dispatch({ type: 'FETCH_CHATS_START' });
    
    try {
      const response = await fetch(`${API_URL}/chats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'FETCH_CHATS_SUCCESS', payload: data });
      } else {
        const error = await response.json();
        dispatch({ type: 'FETCH_CHATS_FAILURE', payload: error.message || 'Error getting chats' });
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      dispatch({ type: 'FETCH_CHATS_FAILURE', payload: 'Connection error' });
    }
  };
  
  // Fetch messages
  const fetchMessages = async (chatId: string) => {
    if (!authState.token) return;
    
    dispatch({ type: 'FETCH_MESSAGES_START' });
    
    try {
      const response = await fetch(`${API_URL}/messages/${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'FETCH_MESSAGES_SUCCESS', payload: data });
      } else {
        const error = await response.json();
        dispatch({ type: 'FETCH_MESSAGES_FAILURE', payload: error.message || 'Error getting messages' });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      dispatch({ type: 'FETCH_MESSAGES_FAILURE', payload: 'Connection error' });
    }
  };
  
  // Fetch users
  const fetchUsers = async () => {
    if (!authState.token) return;
    
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'FETCH_USERS_SUCCESS', payload: data });
      } else {
        const error = await response.json();
        console.error('Error fetching users:', error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  // Set current chat
  const setCurrentChat = (chat: Chat) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: chat });
    fetchMessages(chat._id);
  };
  
  // Clear current chat
  const clearCurrentChat = () => {
    dispatch({ type: 'CLEAR_CURRENT_CHAT' });
  };
  
  // Send message
  const sendMessage = (text: string) => {
    if (!state.currentChat || !authState.token || !socket) return;
    
    const chatId = state.currentChat._id;
    
    // Send message through socket
    socket.emit('sendMessage', { chatId, text });
  };
  
  // Update message
  const updateMessage = async (messageId: string, newText: string) => {
    if (!authState.token) return;
    
    try {
      const response = await fetch(`${API_URL}/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({ text: newText })
      });
      
      if (response.ok) {
        const updatedMessage = await response.json();
        dispatch({ type: 'UPDATE_MESSAGE_SUCCESS', payload: updatedMessage });
      } else {
        const error = await response.json();
        dispatch({ type: 'UPDATE_MESSAGE_FAILURE', payload: error.message || 'Error updating message' });
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Could not update message",
        });
      }
    } catch (error) {
      console.error('Error updating message:', error);
      dispatch({ type: 'UPDATE_MESSAGE_FAILURE', payload: 'Connection error' });
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Could not update message",
      });
    }
  };
  
  // Delete message
  const deleteMessage = async (messageId: string) => {
    if (!authState.token) return;
    
    try {
      const response = await fetch(`${API_URL}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        }
      });
      
      if (response.ok) {
        dispatch({ type: 'DELETE_MESSAGE_SUCCESS', payload: messageId });
      } else {
        const error = await response.json();
        dispatch({ type: 'DELETE_MESSAGE_FAILURE', payload: error.message || 'Error deleting message' });
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Could not delete message",
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      dispatch({ type: 'DELETE_MESSAGE_FAILURE', payload: 'Connection error' });
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Could not delete message",
      });
    }
  };
  
  // Delete chat
  const deleteChat = async (chatId: string) => {
    if (!authState.token) return;
    
    try {
      const response = await fetch(`${API_URL}/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        }
      });
      
      if (response.ok) {
        dispatch({ type: 'DELETE_CHAT_SUCCESS', payload: chatId });
      } else {
        const error = await response.json();
        dispatch({ type: 'DELETE_CHAT_FAILURE', payload: error.message || 'Error deleting chat' });
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Could not delete chat",
        });
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      dispatch({ type: 'DELETE_CHAT_FAILURE', payload: 'Connection error' });
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Could not delete chat",
      });
    }
  };
  
  // Create private chat
  const createPrivateChat = async (userId: string) => {
    if (!authState.token) return;
    
    try {
      const response = await fetch(`${API_URL}/chats/private`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        const newChat = await response.json();
        dispatch({ type: 'CREATE_CHAT_SUCCESS', payload: newChat });
      } else {
        const error = await response.json();
        console.error('Error creating private chat:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Could not create chat",
        });
      }
    } catch (error) {
      console.error('Error creating private chat:', error);
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Could not create chat",
      });
    }
  };
  
  // Create group chat
  const createGroupChat = async (name: string, participants: string[]) => {
    if (!authState.token) return;
    
    try {
      const response = await fetch(`${API_URL}/chats/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({ name, participants })
      });
      
      if (response.ok) {
        const newChat = await response.json();
        dispatch({ type: 'CREATE_CHAT_SUCCESS', payload: newChat });
      } else {
        const error = await response.json();
        console.error('Error creating group chat:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Could not create group",
        });
      }
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Could not create group",
      });
    }
  };
  
  // Add users to group
  const addUsersToGroup = async (chatId: string, userIds: string[]) => {
    if (!authState.token) return;
    
    try {
      const response = await fetch(`${API_URL}/chats/${chatId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({ userIds })
      });
      
      if (response.ok) {
        const updatedChat = await response.json();
        dispatch({ type: 'UPDATE_CHAT_SUCCESS', payload: updatedChat });
      } else {
        const error = await response.json();
        console.error('Error adding users to group:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Could not add users to group",
        });
      }
    } catch (error) {
      console.error('Error adding users to group:', error);
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Could not add users to group",
      });
    }
  };
  
  // Upload file
  const uploadFile = async (file: File) => {
    if (!state.currentChat || !authState.token) return;
    
    dispatch({ type: 'FILE_UPLOAD_START' });
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const base64data = e.target?.result?.toString().split(',')[1];
        
        if (!base64data) {
          throw new Error('Error encoding file');
        }
        
        const chatId = state.currentChat!._id;
        
        const fileData = {
          filename: file.name,
          contentType: file.type,
          data: base64data,
          size: file.size,
          chatId
        };
        
        try {
          const response = await fetch(`${API_URL}/files`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authState.token}`
            },
            body: JSON.stringify(fileData)
          });
          
          if (response.ok) {
            const newMessage = await response.json();
            dispatch({ type: 'FILE_UPLOAD_SUCCESS', payload: newMessage });
          } else {
            const error = await response.json();
            dispatch({ type: 'FILE_UPLOAD_FAILURE', payload: error.message || 'Error uploading file' });
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message || "Could not upload file",
            });
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          dispatch({ type: 'FILE_UPLOAD_FAILURE', payload: 'Connection error' });
          toast({
            variant: "destructive",
            title: "Connection error",
            description: "Could not upload file",
          });
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      dispatch({ type: 'FILE_UPLOAD_FAILURE', payload: 'Error reading file' });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not read file",
      });
    }
  };
  
  // Function to leave a group chat
  const leaveGroup = async (chatId: string) => {
    if (!authState.token || !authState.user) return;
    
    try {
      const response = await fetch(`${API_URL}/chats/${chatId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        }
      });
      
      if (response.ok) {
        dispatch({ type: 'LEAVE_GROUP_SUCCESS', payload: chatId });
        toast({
          title: "Left group",
          description: "You have successfully left the group"
        });
      } else {
        const error = await response.json();
        dispatch({ type: 'LEAVE_GROUP_FAILURE', payload: error.message });
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Error leaving group"
        });
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      dispatch({ type: 'LEAVE_GROUP_FAILURE', payload: 'Error connecting to server' });
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Could not connect to server"
      });
    }
  };

  return (
    <ChatContext.Provider value={{
      state,
      socket,
      sendMessage,
      updateMessage,
      deleteMessage,
      deleteChat,
      uploadFile,
      fetchChats,
      fetchMessages,
      setCurrentChat,
      clearCurrentChat,
      fetchUsers,
      createPrivateChat,
      createGroupChat,
      addUsersToGroup,
      searchMessages,
      clearSearch,
      leaveGroup
    }}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
