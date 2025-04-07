
import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobType } from './JobContext';
import {
  getAllUsers as getFirebaseUsers,
  getUserById as getFirebaseUserById,
  getJobCategories as getFirebaseJobCategories,
  getSkillsList as getFirebaseSkillsList,
  getAllJobs as getFirebaseJobs
} from '@/lib/firebaseUtils';

export type UserType = {
  id: string;
  name: string;
  email: string;
  role: 'freelancer' | 'client';
  bio?: string;
  photoURL?: string;
  skills?: string[];
  hourlyRate?: number;
  joinedAt: number;
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
  const [users, setUsers] = useState<UserType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobCategories, setJobCategories] = useState<string[]>([]);
  const [skillsList, setSkillsList] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users
      const usersData = await getFirebaseUsers();
      setUsers(usersData);
      
      // Load jobs
      const jobsData = await getFirebaseJobs();
      setJobs(jobsData);
      
      // Load categories and skills
      const categories = await getFirebaseJobCategories();
      setJobCategories(categories);
      
      const skills = await getFirebaseSkillsList();
      setSkillsList(skills);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

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
