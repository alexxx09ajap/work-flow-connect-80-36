
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserType } from './AuthContext';

// Categorías profesionales disponibles en la plataforma
export type CategoryType = {
  id: string;
  name: string;
  icon?: string;
};

interface DataContextType {
  users: UserType[];
  jobCategories: CategoryType[];
  skillsList: string[];
  loadingUsers: boolean;
  getUserById: (userId: string) => UserType | undefined;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Datos de simulación
const MOCK_USERS: UserType[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    photoURL: '/assets/avatars/avatar-1.png',
    bio: 'Desarrollador Full Stack con 5 años de experiencia',
    skills: ['React', 'Node.js', 'Firebase', 'TypeScript']
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    photoURL: '/assets/avatars/avatar-2.png',
    bio: 'Diseñadora UX/UI especializada en experiencias móviles',
    skills: ['UI Design', 'Figma', 'Sketch', 'Adobe XD']
  },
  {
    id: '3',
    name: 'Carlos Rodriguez',
    email: 'carlos@example.com',
    photoURL: '/assets/avatars/avatar-3.png',
    bio: 'Especialista en marketing digital con enfoque en SEO',
    skills: ['SEO', 'Google Ads', 'Analytics', 'Content Marketing']
  }
];

const JOB_CATEGORIES: CategoryType[] = [
  { id: '1', name: 'Desarrollo Web' },
  { id: '2', name: 'Diseño' },
  { id: '3', name: 'Marketing' },
  { id: '4', name: 'Redacción' },
  { id: '5', name: 'Traducción' },
  { id: '6', name: 'Contabilidad' },
  { id: '7', name: 'Consultoría' },
  { id: '8', name: 'Soporte Técnico' }
];

const SKILLS_LIST: string[] = [
  'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js',
  'Node.js', 'Express', 'MongoDB', 'SQL', 'Firebase',
  'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
  'UI Design', 'UX Design', 'Figma', 'Sketch', 'Adobe XD',
  'Photoshop', 'Illustrator', 'After Effects', 'SEO',
  'SEM', 'Google Ads', 'Facebook Ads', 'Content Marketing',
  'Email Marketing', 'Social Media', 'WordPress', 'Shopify',
  'PHP', 'Python', 'Java', 'C#', '.NET', 'Ruby on Rails',
  'iOS Development', 'Android Development', 'Flutter', 'React Native'
];

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [jobCategories] = useState<CategoryType[]>(JOB_CATEGORIES);
  const [skillsList] = useState<string[]>(SKILLS_LIST);

  useEffect(() => {
    // Simulamos carga de datos
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoadingUsers(false);
    }, 1000);
  }, []);

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  return (
    <DataContext.Provider
      value={{
        users,
        jobCategories,
        skillsList,
        loadingUsers,
        getUserById
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
