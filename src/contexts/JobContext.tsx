
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserType } from './AuthContext';

export type ReplyType = {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  timestamp: number;
};

export type CommentType = {
  id: string;
  jobId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  timestamp: number;
  replies: ReplyType[];
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
  likes: string[]; // Array de IDs de usuarios que dieron like
};

type JobContextType = {
  jobs: JobType[];
  loading: boolean;
  createJob: (jobData: Omit<JobType, 'id' | 'timestamp' | 'comments' | 'likes'>) => Promise<void>;
  addComment: (jobId: string, content: string, user: UserType) => Promise<void>;
  addReplyToComment: (jobId: string, commentId: string, content: string, user: UserType) => Promise<void>;
  getJob: (jobId: string) => JobType | undefined;
  toggleSavedJob: (jobId: string, userId: string) => void;
  getSavedJobs: (userId: string) => JobType[];
  toggleLike: (jobId: string, userId: string) => void;
  savedJobs: string[]; // Array de IDs de trabajos guardados por el usuario actual
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
        timestamp: Date.now() - 86400000,
        replies: []
      }
    ],
    likes: ['3']
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
    comments: [],
    likes: ['1', '2']
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
    comments: [],
    likes: []
  }
];

interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    // Simulamos carga de datos
    setTimeout(() => {
      setJobs(MOCK_JOBS);
      setLoading(false);
      
      // Simulamos trabajos guardados (en un caso real, esto vendría de la base de datos)
      setSavedJobs(['2']);
    }, 1000);
  }, []);

  const createJob = async (jobData: Omit<JobType, 'id' | 'timestamp' | 'comments' | 'likes'>) => {
    const newJob: JobType = {
      ...jobData,
      id: `job_${Date.now()}`,
      timestamp: Date.now(),
      comments: [],
      likes: []
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
      timestamp: Date.now(),
      replies: []
    };

    setJobs(prevJobs => prevJobs.map(job => 
      job.id === jobId 
        ? { ...job, comments: [...job.comments, newComment] }
        : job
    ));
    
    // En un caso real, aquí guardaríamos el comentario en Firebase
  };

  const addReplyToComment = async (jobId: string, commentId: string, content: string, user: UserType) => {
    const newReply: ReplyType = {
      id: `reply_${Date.now()}`,
      commentId,
      userId: user.id,
      userName: user.name,
      userPhoto: user.photoURL,
      content,
      timestamp: Date.now()
    };

    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id !== jobId) return job;
      
      return {
        ...job,
        comments: job.comments.map(comment => 
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, newReply] }
            : comment
        )
      };
    }));
    
    // En un caso real, aquí guardaríamos la respuesta en Firebase
  };

  const getJob = (jobId: string) => {
    return jobs.find(job => job.id === jobId);
  };

  const toggleSavedJob = (jobId: string, userId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(prev => prev.filter(id => id !== jobId));
    } else {
      setSavedJobs(prev => [...prev, jobId]);
    }
    
    // En un caso real, aquí actualizaríamos la base de datos
  };

  const getSavedJobs = (userId: string) => {
    return jobs.filter(job => savedJobs.includes(job.id));
  };

  const toggleLike = (jobId: string, userId: string) => {
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id !== jobId) return job;
      
      const userLiked = job.likes.includes(userId);
      
      return {
        ...job,
        likes: userLiked
          ? job.likes.filter(id => id !== userId)
          : [...job.likes, userId]
      };
    }));
    
    // En un caso real, aquí actualizaríamos la base de datos
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        loading,
        createJob,
        addComment,
        addReplyToComment,
        getJob,
        toggleSavedJob,
        getSavedJobs,
        toggleLike,
        savedJobs
      }}
    >
      {children}
    </JobContext.Provider>
  );
};
