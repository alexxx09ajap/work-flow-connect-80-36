
export interface UserType {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  role: 'client' | 'freelancer';
  skills?: string[];
  bio?: string;
  joinedAt?: number;
}

export interface AuthState {
  user: UserType | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface ChatType {
  id: string;
  users: string[];
  messages: MessageType[];
  name?: string;
  isGroup?: boolean;
  participants?: any[];
  lastMessage?: {
    content?: string;
    timestamp?: Date;
  };
}

export interface MessageType {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  content?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deleted?: boolean;
  edited?: boolean;
  senderName?: string;
}

export interface JobType {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  skills?: string[];
  status: "open" | "in progress" | "completed";
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  userName?: string;
  userPhoto?: string;
  timestamp?: number;
  comments?: CommentType[];
}

export interface CommentType {
  id: string;
  userId: string;
  jobId: string;
  text: string;
  timestamp: number;
  userName: string;
  userPhoto?: string;
  replies?: CommentType[];
}
