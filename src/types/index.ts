
// User related types
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  photoURL?: string;
  status: 'online' | 'offline';
  id?: string; // For compatibility with existing code
  name?: string; // For compatibility with existing code
  role?: string; // For compatibility with existing code
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Message related types
export interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  text?: string;
  createdAt: string;
  updatedAt: string;
  fileId?: string;
  file?: {
    id: string;
    filename: string;
    contentType: string;
    size: number;
  };
  sender?: User;
  read: boolean;
}

// Chat related types
export interface Chat {
  _id: string;
  name?: string;
  isGroupChat: boolean;
  participants: User[];
  admin?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
  id?: string; // For compatibility with existing code
}
