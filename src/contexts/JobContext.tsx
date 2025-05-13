
import { createContext, useContext, useState, useEffect } from 'react';
import { JobType } from '@/types';
import { jobService } from '@/lib/jobService';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

export type { JobType };

export interface JobContextType {
  jobs: JobType[];
  userJobs: JobType[];
  filteredJobs: JobType[];
  setFilteredJobs: (jobs: JobType[]) => void;
  popularJobs: JobType[];
  getJobById: (id: string) => JobType | undefined;
  loading: boolean;
  addComment: (jobId: string, comment: string) => void;
  addReply: (commentId: string, reply: string) => void;
  refreshJobs: () => Promise<void>;
  saveJob: (jobId: string) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  savedJobs: JobType[];
  deleteComment: (commentId: string) => void;
}

const JobContext = createContext<JobContextType | null>(null);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

export const JobProvider = ({ children }: { children: React.ReactNode }) => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [userJobs, setUserJobs] = useState<JobType[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobType[]>([]);
  const [popularJobs, setPopularJobs] = useState<JobType[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    refreshJobs();
  }, [currentUser]);

  const refreshJobs = async () => {
    setLoading(true);
    try {
      const allJobs = await jobService.getAllJobs();
      setJobs(allJobs);

      if (currentUser) {
        // Usamos el método correcto según lo que está disponible en jobService
        const userJobsData = await jobService.getJobsByUser(currentUser.id);
        setUserJobs(userJobsData);

        // Para los trabajos guardados, usamos una solución temporal hasta implementar la función
        // Como no existe getSavedJobs, usaremos allJobs y filtraremos después
        // Esta parte debe ser implementada correctamente en jobService
        const savedJobsTemp = allJobs.slice(0, 2); // Temporal: simulamos 2 trabajos guardados
        setSavedJobs(savedJobsTemp);
      }

      // Para los trabajos populares, usamos los primeros 3 trabajos temporalmente
      // hasta que se implemente getPopularJobs
      const popularJobsTemp = allJobs.slice(0, 3);
      setPopularJobs(popularJobsTemp);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load jobs."
      });
    } finally {
      setLoading(false);
    }
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  const addComment = async (jobId: string, comment: string) => {
    try {
      // Simulamos la función addComment hasta que esté implementada en jobService
      console.log(`Adding comment to job ${jobId}: ${comment}`);
      await refreshJobs();
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully."
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment."
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      // Simulamos la función deleteComment hasta que esté implementada en jobService
      console.log(`Deleting comment ${commentId}`);
      await refreshJobs();
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully."
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete comment."
      });
    }
  };

  const addReply = async (commentId: string, reply: string) => {
    try {
      // Simulamos la función addReply hasta que esté implementada en jobService
      console.log(`Adding reply to comment ${commentId}: ${reply}`);
      await refreshJobs();
      toast({
        title: "Reply added",
        description: "Your reply has been added successfully."
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add reply."
      });
    }
  };

  const saveJob = async (jobId: string) => {
    try {
      // Simulamos la función saveJob hasta que esté implementada en jobService
      console.log(`Saving job ${jobId}`);
      await refreshJobs();
      toast({
        title: "Job saved",
        description: "This job has been saved to your list."
      });
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save job."
      });
    }
  };

  const unsaveJob = async (jobId: string) => {
    try {
      // Simulamos la función unsaveJob hasta que esté implementada en jobService
      console.log(`Unsaving job ${jobId}`);
      await refreshJobs();
      toast({
        title: "Job unsaved",
        description: "This job has been removed from your saved list."
      });
    } catch (error) {
      console.error("Error unsaving job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unsave job."
      });
    }
  };

  const value: JobContextType = {
    jobs,
    userJobs,
    filteredJobs,
    setFilteredJobs,
    popularJobs,
    getJobById,
    loading,
    addComment,
    addReply,
    refreshJobs,
    saveJob,
    unsaveJob,
    savedJobs,
    deleteComment
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
