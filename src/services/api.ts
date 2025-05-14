import axios from 'axios';
import { ChatType, JobType, UserType, MessageType } from '@/types';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor to include token in all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    localStorage.setItem('token', response.data.token);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }
};

// User service
export const userService = {
  getUsers: async (): Promise<UserType[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  getUser: async (id: string): Promise<UserType> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  updateUser: async (id: string, data: any): Promise<UserType> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};

// Chat service
export const chatService = {
  getChats: async (): Promise<ChatType[]> => {
    const response = await api.get('/chats');
    return response.data;
  },
  createPrivateChat: async (userId: string): Promise<ChatType> => {
    const response = await api.post('/chats/private', { userId });
    return response.data;
  },
  createGroupChat: async (name: string, participantIds: string[]): Promise<ChatType> => {
    const response = await api.post('/chats/group', { name, participantIds });
    return response.data;
  },
  addUsersToChat: async (chatId: string, userIds: string[]): Promise<void> => {
    await api.post(`/chats/${chatId}/users`, { userIds });
  },
  leaveChat: async (chatId: string): Promise<void> => {
    await api.post(`/chats/${chatId}/leave`);
  },
  deleteChat: async (chatId: string): Promise<void> => {
    await api.delete(`/chats/${chatId}`);
  }
};

// Message service
export const messageService = {
  getMessages: async (chatId: string): Promise<MessageType[]> => {
    const response = await api.get(`/messages/${chatId}`);
    return response.data;
  },
  sendMessage: async (chatId: string, content: string): Promise<MessageType> => {
    const response = await api.post('/messages', { chatId, content });
    return response.data;
  },
  updateMessage: async (messageId: string, content: string): Promise<MessageType> => {
    const response = await api.put(`/messages/${messageId}`, { content });
    return response.data;
  },
  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/messages/${messageId}`);
  }
};

// Job service
export const jobService = {
  getJobs: async (): Promise<JobType[]> => {
    const response = await api.get('/jobs');
    return response.data;
  },
  getJob: async (id: string): Promise<JobType> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },
  createJob: async (jobData: any): Promise<JobType> => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },
  updateJob: async (id: string, jobData: any): Promise<JobType> => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },
  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  }
};

// File service
export const fileService = {
  // Upload a file
  uploadFile: async (chatId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', chatId);

      const response = await api.post('/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Get a file URL for download
  getFileUrl: (fileId: string) => {
    return `${API_URL}/files/${fileId}`;
  },

  // Delete a file
  deleteFile: async (fileId: string) => {
    try {
      const response = await api.delete(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
};

export default {
  auth: authService,
  users: userService,
  chats: chatService,
  messages: messageService,
  jobs: jobService,
  files: fileService
};
