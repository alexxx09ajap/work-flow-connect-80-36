export interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  hourlyRate?: number;
  isOnline?: boolean;
  lastSeen?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface JobType {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  skills: string[];
  status: 'open' | 'in progress' | 'completed';
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MessageType {
  id: string;
  chatId?: string;
  senderId: string;
  senderName?: string;
  content: string;
  timestamp: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  edited?: boolean;
  deleted?: boolean;
  fileId?: string;
  file?: {
    filename: string;
    contentType?: string;
    size?: number;
  };
}

export interface ChatType {
  id: string;
  name?: string;
  isGroup?: boolean;
  participants: string[];
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
  users?: string[];
  messages?: MessageType[];
}

export interface FileType {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedBy: string;
  chatId: string;
  createdAt: Date | string;
}
