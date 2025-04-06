
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
  jobs: JobType[]; // Added missing jobs property
  // Adding missing properties for job categories and skills
  jobCategories: string[];
  skillsList: string[];
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

// Sample job categories and skills
const SAMPLE_JOB_CATEGORIES = [
  'Desarrollo Web',
  'Diseño UX/UI',
  'Desarrollo Móvil',
  'Marketing Digital',
  'Redacción y Traducción',
  'Consultoría',
  'Administración de Sistemas',
  'Análisis de Datos'
];

const SAMPLE_SKILLS = [
  'JavaScript',
  'React',
  'Node.js',
  'HTML/CSS',
  'Python',
  'UI Design',
  'UX Research',
  'Figma',
  'Adobe XD',
  'Photoshop',
  'React Native',
  'Flutter',
  'Swift',
  'Kotlin',
  'SEO',
  'SEM',
  'Social Media',
  'Content Writing',
  'Translation',
  'WordPress',
  'PHP',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'DevOps',
  'Docker',
  'Machine Learning'
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

// Sample jobs
const SAMPLE_JOBS: JobType[] = [
  {
    id: 'job1',
    title: 'Desarrollo de una aplicación web para gestión de proyectos',
    description: 'Busco desarrollador para crear una aplicación web de gestión de proyectos con React y Firebase.',
    budget: 2000,
    category: 'Desarrollo Web',
    skills: ['React', 'Firebase', 'JavaScript'],
    userId: '1',
    userName: 'Juan Pérez',
    userPhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
    timestamp: Date.now() - 172800000, // 2 días atrás
    status: 'open',
    comments: [],
    likes: []
  },
  {
    id: 'job2',
    title: 'Diseño de interfaz para aplicación móvil',
    description: 'Necesito un diseñador UI/UX para crear la interfaz de una aplicación móvil de fitness.',
    budget: 1500,
    category: 'Diseño UX/UI',
    skills: ['UI Design', 'UX Design', 'Figma'],
    userId: '2',
    userName: 'María González',
    userPhoto: 'https://randomuser.me/api/portraits/women/2.jpg',
    timestamp: Date.now() - 259200000, // 3 días atrás
    status: 'open',
    comments: [],
    likes: []
  },
  {
    id: 'job3',
    title: 'SEO para tienda online de ropa',
    description: 'Busco especialista en SEO para optimizar mi tienda online de ropa y mejorar su posicionamiento.',
    budget: 800,
    category: 'Marketing Digital',
    skills: ['SEO', 'Google Analytics', 'WordPress'],
    userId: '3',
    userName: 'Carlos Rodriguez',
    userPhoto: 'https://randomuser.me/api/portraits/men/3.jpg',
    timestamp: Date.now() - 345600000, // 4 días atrás
    status: 'in-progress',
    comments: [],
    likes: []
  }
];

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
  const [jobCategories] = useState<string[]>(SAMPLE_JOB_CATEGORIES);
  const [skillsList] = useState<string[]>(SAMPLE_SKILLS);
  const [jobs, setJobs] = useState<JobType[]>(SAMPLE_JOBS); // Added jobs state

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
        loading,
        jobCategories,
        skillsList,
        jobs // Added jobs to the context value
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
