
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserType } from './AuthContext';

export type CommentType = {
  id: string;
  jobId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  timestamp: number;
};

export type JobType = {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  skills: string[];
  userId: string;
  userName: string;
  userPhoto?: string;
  timestamp: number;
  status: 'open' | 'in-progress' | 'completed';
  comments: CommentType[];
};

type JobContextType = {
  jobs: JobType[];
  loading: boolean;
  createJob: (jobData: Omit<JobType, 'id' | 'timestamp' | 'comments'>) => Promise<void>;
  addComment: (jobId: string, content: string, user: UserType) => Promise<void>;
  getJob: (jobId: string) => JobType | undefined;
};

const JobContext = createContext<JobContextType | null>(null);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

// Datos de simulación
const MOCK_JOBS: JobType[] = [
  {
    id: '1',
    title: 'Desarrollo de una aplicación web para gestión de proyectos',
    description: 'Busco desarrollador para crear una aplicación web de gestión de proyectos con React y Firebase.',
    budget: 2000,
    category: 'Desarrollo Web',
    skills: ['React', 'Firebase', 'JavaScript'],
    userId: '2',
    userName: 'Jane Smith',
    userPhoto: '/assets/avatars/avatar-2.png',
    timestamp: Date.now() - 172800000, // 2 días atrás
    status: 'open',
    comments: [
      {
        id: '1',
        jobId: '1',
        userId: '1',
        userName: 'John Doe',
        userPhoto: '/assets/avatars/avatar-1.png',
        content: 'Estoy interesado en este proyecto, tengo experiencia en React y Firebase.',
        timestamp: Date.now() - 86400000
      }
    ]
  },
  {
    id: '2',
    title: 'Diseño de interfaz para aplicación móvil',
    description: 'Necesito un diseñador UI/UX para crear la interfaz de una aplicación móvil de fitness.',
    budget: 1500,
    category: 'Diseño',
    skills: ['UI Design', 'UX Design', 'Figma'],
    userId: '1',
    userName: 'John Doe',
    userPhoto: '/assets/avatars/avatar-1.png',
    timestamp: Date.now() - 259200000, // 3 días atrás
    status: 'open',
    comments: []
  },
  {
    id: '3',
    title: 'SEO para tienda online de ropa',
    description: 'Busco especialista en SEO para optimizar mi tienda online de ropa y mejorar su posicionamiento.',
    budget: 800,
    category: 'Marketing',
    skills: ['SEO', 'Google Analytics', 'WordPress'],
    userId: '2',
    userName: 'Jane Smith',
    userPhoto: '/assets/avatars/avatar-2.png',
    timestamp: Date.now() - 345600000, // 4 días atrás
    status: 'in-progress',
    comments: []
  }
];

interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulamos carga de datos
    setTimeout(() => {
      setJobs(MOCK_JOBS);
      setLoading(false);
    }, 1000);
  }, []);

  const createJob = async (jobData: Omit<JobType, 'id' | 'timestamp' | 'comments'>) => {
    const newJob: JobType = {
      ...jobData,
      id: `job_${Date.now()}`,
      timestamp: Date.now(),
      comments: []
    };

    setJobs(prevJobs => [...prevJobs, newJob]);
    
    // En un caso real, aquí guardaríamos el trabajo en Firebase
  };

  const addComment = async (jobId: string, content: string, user: UserType) => {
    const newComment: CommentType = {
      id: `comment_${Date.now()}`,
      jobId,
      userId: user.id,
      userName: user.name,
      userPhoto: user.photoURL,
      content,
      timestamp: Date.now()
    };

    setJobs(prevJobs => prevJobs.map(job => 
      job.id === jobId 
        ? { ...job, comments: [...job.comments, newComment] }
        : job
    ));
    
    // En un caso real, aquí guardaríamos el comentario en Firebase
  };

  const getJob = (jobId: string) => {
    return jobs.find(job => job.id === jobId);
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        loading,
        createJob,
        addComment,
        getJob
      }}
    >
      {children}
    </JobContext.Provider>
  );
};
