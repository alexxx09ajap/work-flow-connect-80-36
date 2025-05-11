
import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobType } from './JobContext';
import { MOCK_USERS, MOCK_JOBS, JOB_CATEGORIES, SKILLS_LIST } from '@/lib/mockData';

// Make sure the UserType in DataContext matches or extends the AuthContext UserType
export type UserType = {
  id: string;
  name: string;
  email: string;
  role: "freelancer" | "client";
  skills?: string[];
  bio?: string;
  photoURL?: string;
  hourlyRate?: number;
  joinedAt?: number;
};

export type CommentType = {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
};

export interface DataContextType {
  users: UserType[];
  getUserById: (userId: string) => UserType | undefined;
  getAllUsers: () => UserType[];
  loading: boolean;
  jobs: JobType[];
  jobCategories: string[];
  skillsList: string[];
  loadData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<UserType[]>(MOCK_USERS);
  const [jobs, setJobs] = useState<JobType[]>(MOCK_JOBS);
  const [loading, setLoading] = useState(false);
  const [jobCategories, setJobCategories] = useState<string[]>(JOB_CATEGORIES);
  const [skillsList, setSkillsList] = useState<string[]>(SKILLS_LIST);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulamos un retardo para la carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Usamos los datos simulados
      setUsers(MOCK_USERS);
      setJobs(MOCK_JOBS);
      setJobCategories(JOB_CATEGORIES);
      setSkillsList(SKILLS_LIST);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargamos los datos al inicio
  useEffect(() => {
    loadData();
  }, []);

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };
  
  const getAllUsers = () => {
    return users;
  };

  return (
    <DataContext.Provider
      value={{
        users,
        getUserById,
        getAllUsers,
        loading,
        jobCategories,
        skillsList,
        jobs,
        loadData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
