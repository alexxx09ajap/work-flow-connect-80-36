
import { JobType } from '@/types';
import { UserType } from '@/types';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const jobService = {
  getAllJobs: async (): Promise<JobType[]> => {
    try {
      console.log(`Fetching jobs from: ${API_URL}/jobs`);
      const response = await axios.get(`${API_URL}/jobs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Jobs response:", response.data);
      
      if (response.data.success) {
        return response.data.jobs;
      }
      return [];
    } catch (error) {
      console.error("Error fetching jobs:", error);
      // Mostrar un toast con el error
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error al obtener las propuestas: ${axios.isAxiosError(error) ? error.message : 'Error desconocido'}`
      });
      throw error;
    }
  },
  
  getJobById: async (id: string): Promise<JobType | null> => {
    try {
      console.log(`Fetching job with ID: ${id}`);
      const response = await axios.get(`${API_URL}/jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Job response:", response.data);
      
      if (response.data.success) {
        return response.data.job;
      }
      return null;
    } catch (error) {
      console.error("Error fetching job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error al obtener la propuesta: ${axios.isAxiosError(error) ? error.message : 'Error desconocido'}`
      });
      throw error;
    }
  },
  
  getJobsByUser: async (userId: string): Promise<JobType[]> => {
    try {
      // For now, we'll filter all jobs by user ID
      const allJobs = await jobService.getAllJobs();
      return allJobs.filter(job => job.userId === userId);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error al obtener las propuestas del usuario: ${axios.isAxiosError(error) ? error.message : 'Error desconocido'}`
      });
      throw error;
    }
  },
  
  createJob: async (jobData: Partial<JobType>): Promise<JobType> => {
    try {
      console.log("Creating job with data:", jobData);
      // Validar que los datos requeridos estén presentes
      if (!jobData.title || !jobData.description || !jobData.category || jobData.budget === undefined) {
        const errorMsg = "Datos incompletos para crear la propuesta";
        console.error(errorMsg, jobData);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMsg
        });
        throw new Error(errorMsg);
      }
      
      const response = await axios.post(`${API_URL}/jobs`, jobData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Create job response:", response.data);
      
      if (response.data.success) {
        toast({
          title: "Éxito",
          description: "Propuesta creada correctamente"
        });
        return response.data.job;
      }
      
      const errorMsg = response.data.message || "Error al crear la propuesta";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg
      });
      throw new Error(errorMsg);
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error al crear la propuesta: ${axios.isAxiosError(error) ? (error.response?.data?.message || error.message) : 'Error desconocido'}`
      });
      throw error;
    }
  },
  
  updateJob: async (id: string, jobData: Partial<JobType>): Promise<JobType | null> => {
    try {
      console.log(`Updating job with ID: ${id}`, jobData);
      const response = await axios.put(`${API_URL}/jobs/${id}`, jobData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Update job response:", response.data);
      
      if (response.data.success) {
        toast({
          title: "Éxito",
          description: "Propuesta actualizada correctamente"
        });
        return response.data.job;
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: response.data.message || "Error al actualizar la propuesta"
      });
      return null;
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error al actualizar la propuesta: ${axios.isAxiosError(error) ? error.message : 'Error desconocido'}`
      });
      throw error;
    }
  },
  
  deleteJob: async (id: string): Promise<boolean> => {
    try {
      console.log(`Deleting job with ID: ${id}`);
      const response = await axios.delete(`${API_URL}/jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Delete job response:", response.data);
      
      if (response.data.success) {
        toast({
          title: "Éxito",
          description: "Propuesta eliminada correctamente"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Error al eliminar la propuesta"
        });
      }
      
      return response.data.success;
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error al eliminar la propuesta: ${axios.isAxiosError(error) ? error.message : 'Error desconocido'}`
      });
      throw error;
    }
  }
};

export const userService = {
  getUserById: async (id: string): Promise<UserType | null> => {
    try {
      const response = await axios.get(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }
};
