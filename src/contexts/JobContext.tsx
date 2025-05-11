
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserType } from './AuthContext';
import { MOCK_JOBS, SAVED_JOBS } from '@/lib/mockData'; 
import { toast } from '@/components/ui/use-toast';

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
  likes: string[]; // Array de IDs de usuarios que dieron like;
};

type JobContextType = {
  jobs: JobType[];
  loading: boolean;
  createJob: (jobData: Omit<JobType, 'id' | 'timestamp' | 'comments' | 'likes'>) => Promise<JobType>;
  updateJob: (jobId: string, jobData: Partial<JobType>) => Promise<JobType>;
  deleteJob: (jobId: string) => Promise<boolean>;
  addComment: (jobId: string, content: string, user: UserType) => Promise<void>;
  addReplyToComment: (jobId: string, commentId: string, content: string, user: UserType) => Promise<void>;
  getJob: (jobId: string) => JobType | undefined;
  toggleSavedJob: (jobId: string, userId: string) => void;
  getSavedJobs: (userId: string) => Promise<JobType[]>;
  toggleLike: (jobId: string, userId: string) => void;
  savedJobs: string[]; // Array de IDs de trabajos guardados por el usuario actual
  loadJobs: () => Promise<void>; // Add method to refresh jobs
};

const JobContext = createContext<JobContextType | null>(null);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<JobType[]>(MOCK_JOBS);
  const [loading, setLoading] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>(SAVED_JOBS);

  const loadJobs = async () => {
    setLoading(true);
    try {
      // Simulamos un retardo para la carga
      await new Promise(resolve => setTimeout(resolve, 800));
      setJobs(MOCK_JOBS);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const createJob = async (jobData: Omit<JobType, 'id' | 'timestamp' | 'comments' | 'likes'>) => {
    try {
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Creamos un nuevo trabajo con ID único
      const newJob: JobType = {
        id: `job${Date.now()}`,
        ...jobData,
        timestamp: Date.now(),
        comments: [],
        likes: []
      };
      
      // Actualizamos el estado local
      setJobs(prevJobs => [...prevJobs, newJob]);
      
      // En un caso real, esto se guardaría en la base de datos
      MOCK_JOBS.push(newJob);
      
      return newJob;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  };

  const updateJob = async (jobId: string, jobData: Partial<JobType>) => {
    try {
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Encontramos el índice del trabajo a actualizar
      const jobIndex = jobs.findIndex(job => job.id === jobId);
      
      if (jobIndex === -1) {
        throw new Error('Trabajo no encontrado');
      }
      
      // Actualizamos el trabajo
      const updatedJob = {
        ...jobs[jobIndex],
        ...jobData
      };
      
      // Actualizamos el estado local
      setJobs(prevJobs => 
        prevJobs.map(job => job.id === jobId ? updatedJob : job)
      );
      
      // En un caso real, esto actualizaría la base de datos
      const mockJobIndex = MOCK_JOBS.findIndex(job => job.id === jobId);
      if (mockJobIndex !== -1) {
        MOCK_JOBS[mockJobIndex] = updatedJob;
      }
      
      return updatedJob;
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Eliminamos el trabajo del estado local
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      // En un caso real, esto eliminaría de la base de datos
      const mockJobIndex = MOCK_JOBS.findIndex(job => job.id === jobId);
      if (mockJobIndex !== -1) {
        MOCK_JOBS.splice(mockJobIndex, 1);
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  };

  const addComment = async (jobId: string, content: string, user: UserType) => {
    try {
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      
      // Actualizamos el estado local
      setJobs(prevJobs => prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, comments: [...job.comments, newComment] }
          : job
      ));
      
      // En un caso real, esto actualizaría la base de datos
      const mockJobIndex = MOCK_JOBS.findIndex(job => job.id === jobId);
      if (mockJobIndex !== -1) {
        MOCK_JOBS[mockJobIndex].comments.push(newComment);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  const addReplyToComment = async (jobId: string, commentId: string, content: string, user: UserType) => {
    try {
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newReply: ReplyType = {
        id: `reply_${Date.now()}`,
        commentId,
        userId: user.id,
        userName: user.name,
        userPhoto: user.photoURL,
        content,
        timestamp: Date.now()
      };
      
      // Actualizamos el estado local
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
      
      // En un caso real, esto actualizaría la base de datos
      const mockJobIndex = MOCK_JOBS.findIndex(job => job.id === jobId);
      if (mockJobIndex !== -1) {
        const commentIndex = MOCK_JOBS[mockJobIndex].comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          MOCK_JOBS[mockJobIndex].comments[commentIndex].replies.push(newReply);
        }
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      throw error;
    }
  };

  const getJob = (jobId: string) => {
    return jobs.find(job => job.id === jobId);
  };

  const toggleSavedJob = (jobId: string, userId: string) => {
    try {
      // Verificamos si el trabajo ya está guardado
      const isJobSaved = savedJobs.includes(jobId);
      
      // Actualizamos el estado local
      setSavedJobs(prev => {
        if (isJobSaved) {
          return prev.filter(id => id !== jobId);
        } else {
          return [...prev, jobId];
        }
      });
      
      // En un caso real, esto actualizaría la base de datos
      if (isJobSaved) {
        SAVED_JOBS = SAVED_JOBS.filter(id => id !== jobId);
      } else {
        SAVED_JOBS.push(jobId);
      }
      
      // Notificamos al usuario
      toast({
        title: isJobSaved ? "Propuesta eliminada de guardados" : "Propuesta guardada",
        description: isJobSaved 
          ? "La propuesta ha sido eliminada de tus guardados" 
          : "La propuesta ha sido añadida a tus guardados"
      });
    } catch (error) {
      console.error("Error toggling saved job:", error);
    }
  };

  const getSavedJobs = async (userId: string) => {
    try {
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Obtenemos los IDs de trabajos guardados
      const savedJobIds = savedJobs;
      setSavedJobs(savedJobIds);
      
      // Filtramos los trabajos guardados
      const savedJobsList = jobs.filter(job => savedJobIds.includes(job.id));
      
      return savedJobsList;
    } catch (error) {
      console.error("Error getting saved jobs:", error);
      return [];
    }
  };

  const toggleLike = (jobId: string, userId: string) => {
    try {
      // Actualizamos el estado local
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
      
      // En un caso real, esto actualizaría la base de datos
      const mockJobIndex = MOCK_JOBS.findIndex(job => job.id === jobId);
      if (mockJobIndex !== -1) {
        const userLiked = MOCK_JOBS[mockJobIndex].likes.includes(userId);
        
        if (userLiked) {
          MOCK_JOBS[mockJobIndex].likes = MOCK_JOBS[mockJobIndex].likes.filter(id => id !== userId);
        } else {
          MOCK_JOBS[mockJobIndex].likes.push(userId);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        loading,
        createJob,
        updateJob,
        deleteJob,
        addComment,
        addReplyToComment,
        getJob,
        toggleSavedJob,
        getSavedJobs,
        toggleLike,
        savedJobs,
        loadJobs
      }}
    >
      {children}
    </JobContext.Provider>
  );
};
