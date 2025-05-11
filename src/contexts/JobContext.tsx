
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserType } from './AuthContext';
import { toast } from '@/components/ui/use-toast';
import { MOCK_JOBS } from '@/lib/mockData'; 

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
  likes: string[]; // Array of user IDs who liked;
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
  savedJobs: string[]; // Array of saved job IDs by the current user
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
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      // For now we're using mock data, but in the future we can fetch from the backend
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
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new job with unique ID
      const newJob: JobType = {
        id: `job${Date.now()}`,
        ...jobData,
        timestamp: Date.now(),
        comments: [],
        likes: []
      };
      
      // Update local state
      setJobs(prevJobs => [...prevJobs, newJob]);
      
      // In a real scenario, this would be saved to the database
      MOCK_JOBS.push(newJob);
      
      return newJob;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  };

  const updateJob = async (jobId: string, jobData: Partial<JobType>) => {
    try {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find the job to update
      const jobIndex = jobs.findIndex(job => job.id === jobId);
      
      if (jobIndex === -1) {
        throw new Error('Job not found');
      }
      
      // Update the job
      const updatedJob = {
        ...jobs[jobIndex],
        ...jobData
      };
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(job => job.id === jobId ? updatedJob : job)
      );
      
      // In a real scenario, this would update the database
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
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Remove job from local state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      // In a real scenario, this would delete from the database
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
      // Simulate delay
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
      
      // Update local state
      setJobs(prevJobs => prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, comments: [...job.comments, newComment] }
          : job
      ));
      
      // In a real scenario, this would update the database
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
      // Simulate delay
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
      
      // Update local state
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
      
      // In a real scenario, this would update the database
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
      // Check if job is already saved
      const isJobSaved = savedJobs.includes(jobId);
      
      // Update local state
      setSavedJobs(prev => {
        if (isJobSaved) {
          return prev.filter(id => id !== jobId);
        } else {
          return [...prev, jobId];
        }
      });
      
      // Notify user
      toast({
        title: isJobSaved ? "Proposal removed from saved" : "Proposal saved",
        description: isJobSaved 
          ? "The proposal has been removed from your saved items" 
          : "The proposal has been added to your saved items"
      });
    } catch (error) {
      console.error("Error toggling saved job:", error);
    }
  };

  const getSavedJobs = async (userId: string) => {
    try {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Filter saved jobs
      const savedJobsList = jobs.filter(job => savedJobs.includes(job.id));
      
      return savedJobsList;
    } catch (error) {
      console.error("Error getting saved jobs:", error);
      return [];
    }
  };

  const toggleLike = (jobId: string, userId: string) => {
    try {
      // Update local state
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
      
      // In a real scenario, this would update the database
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
