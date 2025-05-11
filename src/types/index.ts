
export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  isOnline?: boolean;
  status?: string;
  lastSeen?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  joinedAt?: number; // Added to match what's used in ProfilePage
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface ChatType {
  id: string;
  name: string;
  isGroup: boolean;
  participants: string[];
  lastMessage?: {
    content: string;
    timestamp: number;
  };
}

export interface MessageType {
  id: string;
  content: string;
  timestamp: number;
  senderId: string;
  senderName: string;
  read: boolean;
}

// Type aliases to avoid circular dependencies
export type UserType = User;
