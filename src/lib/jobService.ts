
import { JobType } from '@/types';
import { UserType } from '@/types';
import axios from 'axios';

// Datos de ejemplo para desarrollo
const mockJobs: JobType[] = [
  {
    id: '1',
    title: 'Diseño de logo empresarial',
    description: 'Necesito un logo moderno para mi startup de tecnología. Debe ser minimalista y representar innovación.',
    budget: 300,
    category: 'Diseño Gráfico',
    skills: ['Illustrator', 'Photoshop', 'Branding'],
    status: 'open',
    userId: '101',
    userName: 'Carlos Rodriguez',
    userPhoto: 'https://i.pravatar.cc/150?img=1',
    createdAt: new Date(),
    updatedAt: new Date(),
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 días atrás
  },
  {
    id: '2',
    title: 'Desarrollo de landing page',
    description: 'Requiero una landing page atractiva para mi nuevo producto. Debe ser responsive y optimizada para SEO.',
    budget: 500,
    category: 'Desarrollo Web',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    status: 'in progress',
    userId: '102',
    userName: 'Ana Martínez',
    userPhoto: 'https://i.pravatar.cc/150?img=2',
    createdAt: new Date(),
    updatedAt: new Date(),
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 // 5 días atrás
  },
  {
    id: '3',
    title: 'Traducción de documentos técnicos',
    description: 'Necesito traducir un manual técnico de 30 páginas de inglés a español. El documento contiene terminología especializada en ingeniería.',
    budget: 250,
    category: 'Traducción',
    skills: ['Inglés', 'Español', 'Terminología Técnica'],
    status: 'open',
    userId: '103',
    userName: 'Miguel López',
    userPhoto: 'https://i.pravatar.cc/150?img=3',
    createdAt: new Date(),
    updatedAt: new Date(),
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 // 1 día atrás
  }
];

// Determina si usamos datos de ejemplo o conexión real
const useMockData = true;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const jobService = {
  getAllJobs: async (): Promise<JobType[]> => {
    if (useMockData) {
      console.log('Using mock data for jobs');
      return Promise.resolve([...mockJobs]);
    }

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
      // En caso de error, usamos datos de ejemplo
      return [...mockJobs];
    }
  },
  
  getJobById: async (id: string): Promise<JobType | null> => {
    if (useMockData) {
      const job = mockJobs.find(job => job.id === id);
      return Promise.resolve(job || null);
    }

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
      // En caso de error, buscamos en datos de ejemplo
      const job = mockJobs.find(job => job.id === id);
      return job || null;
    }
  },
  
  getJobsByUser: async (userId: string): Promise<JobType[]> => {
    if (useMockData) {
      return Promise.resolve(mockJobs.filter(job => job.userId === userId));
    }

    try {
      // For now, we'll filter all jobs by user ID
      const allJobs = await jobService.getAllJobs();
      return allJobs.filter(job => job.userId === userId);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
      // En caso de error, filtramos los datos de ejemplo
      return mockJobs.filter(job => job.userId === userId);
    }
  },
  
  createJob: async (jobData: Partial<JobType>): Promise<JobType> => {
    if (useMockData) {
      const newJob: JobType = {
        id: `job-${Date.now()}`,
        title: jobData.title || 'Sin título',
        description: jobData.description || 'Sin descripción',
        budget: jobData.budget || 0,
        category: jobData.category || 'Sin categoría',
        skills: jobData.skills || [],
        status: jobData.status as "open" | "in progress" | "completed" || "open",
        userId: jobData.userId || '101',
        userName: 'Usuario Actual',
        userPhoto: 'https://i.pravatar.cc/150?img=8',
        createdAt: new Date(),
        updatedAt: new Date(),
        timestamp: Date.now()
      };
      
      // Agregamos al inicio para que aparezca primero
      mockJobs.unshift(newJob);
      return Promise.resolve(newJob);
    }

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
    if (useMockData) {
      const index = mockJobs.findIndex(job => job.id === id);
      if (index !== -1) {
        mockJobs[index] = { ...mockJobs[index], ...jobData, updatedAt: new Date() };
        return Promise.resolve(mockJobs[index]);
      }
      return null;
    }

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
    if (useMockData) {
      const index = mockJobs.findIndex(job => job.id === id);
      if (index !== -1) {
        mockJobs.splice(index, 1);
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    }

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
    // Datos de ejemplo para usuarios
    const mockUsers: Record<string, UserType> = {
      '101': {
        id: '101',
        name: 'Carlos Rodriguez',
        email: 'carlos@example.com',
        photoURL: 'https://i.pravatar.cc/150?img=1',
        role: 'client'
      },
      '102': {
        id: '102',
        name: 'Ana Martínez',
        email: 'ana@example.com',
        photoURL: 'https://i.pravatar.cc/150?img=2',
        role: 'freelancer'
      },
      '103': {
        id: '103',
        name: 'Miguel López',
        email: 'miguel@example.com',
        photoURL: 'https://i.pravatar.cc/150?img=3',
        role: 'client'
      }
    };

    if (useMockData) {
      return Promise.resolve(mockUsers[id] || null);
    }

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
      return mockUsers[id] || null;
    }
  }
};
