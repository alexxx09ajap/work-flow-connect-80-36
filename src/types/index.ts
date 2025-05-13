export interface UserType {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  role: 'client' | 'freelancer';
  skills?: string[];
  description?: string;
}

export interface ChatType {
  id: string;
  users: string[];
  messages: MessageType[];
}

export interface MessageType {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
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
}
