
import { JobType } from '@/types';
import { UserType } from '@/types';

// Mock functions for job services
export const jobService = {
  getAllJobs: async (): Promise<JobType[]> => {
    // Mock data for jobs
    return [
      {
        id: "1",
        title: "Diseño de Sitio Web",
        description: "Necesito un diseño moderno para mi sitio web de ecommerce",
        budget: 500,
        category: "Diseño Web",
        skills: ["HTML", "CSS", "JavaScript"],
        status: "open",
        userId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
        userName: "Usuario Ejemplo",
        userPhoto: ""
      },
      {
        id: "2",
        title: "Desarrollo de Aplicación Móvil",
        description: "Busco desarrollador para crear una app de delivery",
        budget: 1000,
        category: "Desarrollo Móvil",
        skills: ["React Native", "Firebase"],
        status: "in progress",
        userId: "2",
        createdAt: new Date(),
        updatedAt: new Date(),
        userName: "Cliente Demo",
        userPhoto: ""
      }
    ];
  },
  
  getJobById: async (id: string): Promise<JobType | null> => {
    const jobs = await jobService.getAllJobs();
    return jobs.find(job => job.id === id) || null;
  },
  
  getJobsByUser: async (userId: string): Promise<JobType[]> => {
    const jobs = await jobService.getAllJobs();
    return jobs.filter(job => job.userId === userId);
  },
  
  createJob: async (jobData: Partial<JobType>): Promise<JobType | null> => {
    console.log("Creating job:", jobData);
    return null;
  },
  
  updateJob: async (id: string, jobData: Partial<JobType>): Promise<JobType | null> => {
    console.log("Updating job:", id, jobData);
    return null;
  },
  
  deleteJob: async (id: string): Promise<boolean> => {
    console.log("Deleting job:", id);
    return false;
  }
};

export const userService = {
  getUserById: async (id: string): Promise<UserType | null> => {
    return null;
  }
};
