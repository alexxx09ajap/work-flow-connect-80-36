
import { createContext, useContext, useState, useEffect } from 'react';
import { JobType } from '@/types';
import { jobService } from '@/lib/jobService';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

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
  createJob: (jobData: Partial<JobType>) => Promise<JobType | null>;
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
      setFilteredJobs(allJobs);

      if (currentUser) {
        const userJobsData = await jobService.getJobsByUser(currentUser.id);
        setUserJobs(userJobsData);

        // In a real implementation, we would fetch saved jobs from the backend
        // This is a placeholder until that endpoint is implemented
        setSavedJobs([]);
      }

      // For popular jobs, we're showing the first 3 most recent jobs
      const popularJobsTemp = allJobs.slice(0, 3);
      setPopularJobs(popularJobsTemp);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los trabajos."
      });
    } finally {
      setLoading(false);
    }
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  const createJob = async (jobData: Partial<JobType>): Promise<JobType | null> => {
    try {
      const createdJob = await jobService.createJob(jobData);
      
      // Refresh jobs after creating a new one
      await refreshJobs();
      
      toast({
        title: "Propuesta creada",
        description: "La propuesta se ha creado correctamente."
      });
      
      return createdJob;
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al crear la propuesta."
      });
      return null;
    }
  };

  const addComment = async (jobId: string, comment: string) => {
    // This will be implemented when comment functionality is added
    toast({
      title: "Funcionalidad no implementada",
      description: "La funcionalidad de comentarios será implementada próximamente."
    });
  };

  const deleteComment = async (commentId: string) => {
    // This will be implemented when comment functionality is added
    toast({
      title: "Funcionalidad no implementada",
      description: "La funcionalidad de eliminar comentarios será implementada próximamente."
    });
  };

  const addReply = async (commentId: string, reply: string) => {
    // This will be implemented when comment functionality is added
    toast({
      title: "Funcionalidad no implementada",
      description: "La funcionalidad de respuestas será implementada próximamente."
    });
  };

  const saveJob = async (jobId: string) => {
    // This will be implemented when job saving functionality is added
    toast({
      title: "Funcionalidad no implementada",
      description: "La funcionalidad de guardar trabajos será implementada próximamente."
    });
  };

  const unsaveJob = async (jobId: string) => {
    // This will be implemented when job saving functionality is added
    toast({
      title: "Funcionalidad no implementada",
      description: "La funcionalidad de quitar trabajos guardados será implementada próximamente."
    });
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
    deleteComment,
    createJob
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
