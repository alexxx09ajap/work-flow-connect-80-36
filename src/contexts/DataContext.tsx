
// Add the missing getAllUsers function to DataContextType
import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobType } from './JobContext';

export type UserType = {
  id: string;
  name: string;
  email: string;
  role: 'freelancer' | 'client';
  bio?: string;
  photoURL?: string;
  skills?: string[];
  hourlyRate?: number;
  joinedAt: number;
};

export type CommentType = {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
};

export interface DataContextType {
  users: UserType[];
  getUserById: (userId: string) => UserType | undefined;
  getAllUsers: () => UserType[];
  comments: Record<string, CommentType[]>;
  addComment: (jobId: string, userId: string, text: string) => void;
  getComments: (jobId: string) => CommentType[];
  loading: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

// Sample data for development
const SAMPLE_USERS: UserType[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    role: 'client',
    bio: 'Dueño de una startup de tecnología',
    photoURL: 'https://randomuser.me/api/portraits/men/1.jpg',
    joinedAt: Date.now() - 7776000000 // 90 days ago
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria@example.com',
    role: 'freelancer',
    bio: 'Desarrolladora web con 5 años de experiencia',
    skills: ['React', 'Node.js', 'MongoDB'],
    hourlyRate: 25,
    photoURL: 'https://randomuser.me/api/portraits/women/2.jpg',
    joinedAt: Date.now() - 5184000000 // 60 days ago
  },
  {
    id: '3',
    name: 'Carlos Rodriguez',
    email: 'carlos@example.com',
    role: 'freelancer',
    bio: 'Diseñador UX/UI especializado en aplicaciones móviles',
    skills: ['UX/UI', 'Figma', 'Adobe XD'],
    hourlyRate: 30,
    photoURL: 'https://randomuser.me/api/portraits/men/3.jpg',
    joinedAt: Date.now() - 2592000000 // 30 days ago
  }
];

const SAMPLE_COMMENTS: Record<string, CommentType[]> = {
  'job1': [
    {
      id: 'comment1',
      userId: '2',
      text: 'Me interesa este proyecto. Tengo experiencia en desarrollo web con React.',
      timestamp: Date.now() - 86400000 // 1 day ago
    },
    {
      id: 'comment2',
      userId: '1',
      text: 'Gracias por tu interés. ¿Podrías compartirme tu portafolio?',
      timestamp: Date.now() - 43200000 // 12 hours ago
    }
  ],
  'job2': [
    {
      id: 'comment3',
      userId: '3',
      text: 'Puedo desarrollar el diseño en Figma y entregar los componentes para React.',
      timestamp: Date.now() - 172800000 // 2 days ago
    }
  ]
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<UserType[]>(SAMPLE_USERS);
  const [comments, setComments] = useState<Record<string, CommentType[]>>(SAMPLE_COMMENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };
  
  const getAllUsers = () => {
    return users;
  };

  const addComment = (jobId: string, userId: string, text: string) => {
    const newComment: CommentType = {
      id: `comment_${Date.now()}`,
      userId,
      text,
      timestamp: Date.now()
    };

    setComments(prev => {
      const jobComments = prev[jobId] || [];
      return {
        ...prev,
        [jobId]: [...jobComments, newComment]
      };
    });
  };

  const getComments = (jobId: string) => {
    return comments[jobId] || [];
  };

  return (
    <DataContext.Provider
      value={{
        users,
        getUserById,
        getAllUsers,
        comments,
        addComment,
        getComments,
        loading
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
