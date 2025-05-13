
import { JobType } from '@/types';
import { UserType } from '@/types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const jobService = {
  getAllJobs: async (): Promise<JobType[]> => {
    try {
      const response = await axios.get(`${API_URL}/jobs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        return response.data.jobs;
      }
      return [];
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  },
  
  getJobById: async (id: string): Promise<JobType | null> => {
    try {
      const response = await axios.get(`${API_URL}/jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        return response.data.job;
      }
      return null;
    } catch (error) {
      console.error("Error fetching job:", error);
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
      throw error;
    }
  },
  
  createJob: async (jobData: Partial<JobType>): Promise<JobType> => {
    try {
      const response = await axios.post(`${API_URL}/jobs`, jobData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        return response.data.job;
      }
      throw new Error(response.data.message || "Failed to create job");
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  },
  
  updateJob: async (id: string, jobData: Partial<JobType>): Promise<JobType | null> => {
    try {
      const response = await axios.put(`${API_URL}/jobs/${id}`, jobData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        return response.data.job;
      }
      return null;
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  },
  
  deleteJob: async (id: string): Promise<boolean> => {
    try {
      const response = await axios.delete(`${API_URL}/jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data.success;
    } catch (error) {
      console.error("Error deleting job:", error);
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
      return null;
    }
  }
};
