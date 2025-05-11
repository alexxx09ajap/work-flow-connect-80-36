
import { JobType, UserType } from "@/types";

export const mockUsers: UserType[] = [
  {
    id: '101',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    photoURL: 'https://randomuser.me/api/portraits/women/1.jpg',
    bio: 'Web Developer specializing in React and Node.js.',
    location: 'San Francisco, CA',
    skills: ['React', 'Node.js', 'JavaScript', 'HTML', 'CSS'],
    isOnline: true
  },
  {
    id: '102',
    name: 'Bob Williams',
    email: 'bob.williams@example.com',
    photoURL: 'https://randomuser.me/api/portraits/men/2.jpg',
    bio: 'Mobile App Developer experienced in iOS and Android development.',
    location: 'New York, NY',
    skills: ['Swift', 'Kotlin', 'React Native', 'Java'],
    isOnline: false
  },
  {
    id: '103',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    photoURL: 'https://randomuser.me/api/portraits/men/3.jpg',
    bio: 'Data Scientist passionate about machine learning and AI.',
    location: 'Seattle, WA',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
    isOnline: true
  },
  {
    id: '104',
    name: 'Diana Miller',
    email: 'diana.miller@example.com',
    photoURL: 'https://randomuser.me/api/portraits/women/4.jpg',
    bio: 'UI/UX Designer focused on creating intuitive and engaging user experiences.',
    location: 'Los Angeles, CA',
    skills: ['UI Design', 'UX Design', 'Figma', 'Adobe XD'],
    isOnline: false
  },
  {
    id: '105',
    name: 'Ethan Davis',
    email: 'ethan.davis@example.com',
    photoURL: 'https://randomuser.me/api/portraits/men/5.jpg',
    bio: 'Project Manager with a proven track record of delivering successful projects on time and within budget.',
    location: 'Chicago, IL',
    skills: ['Project Management', 'Agile', 'Scrum', 'Leadership'],
    isOnline: true
  }
];

// Jobs data
export const mockJobs: JobType[] = [
  {
    id: '1',
    title: 'Diseño de sitio web para empresa de tecnología',
    description: 'Necesitamos un diseñador web para crear un sitio moderno y responsive para nuestra startup de tecnología...',
    budget: 1500,
    category: 'Diseño Web',
    skills: ['HTML', 'CSS', 'JavaScript'],
    status: 'open',
    userId: '101'
  },
  {
    id: '2',
    title: 'Desarrollo de aplicación móvil para iOS y Android',
    description: 'Buscamos un desarrollador de aplicaciones móviles con experiencia en React Native para crear una aplicación para iOS y Android...',
    budget: 3000,
    category: 'Desarrollo Móvil',
    skills: ['React Native', 'JavaScript', 'iOS', 'Android'],
    status: 'in progress',
    userId: '102'
  },
  {
    id: '3',
    title: 'Análisis de datos y creación de modelos de machine learning',
    description: 'Requerimos un científico de datos para analizar nuestros datos y crear modelos de machine learning para mejorar nuestras predicciones...',
    budget: 2500,
    category: 'Ciencia de Datos',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
    status: 'completed',
    userId: '103'
  },
  {
    id: '4',
    title: 'Diseño de interfaz de usuario (UI) y experiencia de usuario (UX)',
    description: 'Estamos buscando un diseñador de UI/UX para crear una interfaz de usuario intuitiva y atractiva para nuestra aplicación web...',
    budget: 1200,
    category: 'Diseño UI/UX',
    skills: ['UI Design', 'UX Design', 'Figma', 'Adobe XD'],
    status: 'open',
    userId: '104'
  },
  {
    id: '5',
    title: 'Gestión de proyecto para el desarrollo de software',
    description: 'Necesitamos un gestor de proyecto para liderar el desarrollo de nuestro nuevo software, asegurando que se entregue a tiempo y dentro del presupuesto...',
    budget: 4000,
    category: 'Gestión de Proyectos',
    skills: ['Project Management', 'Agile', 'Scrum', 'Leadership'],
    status: 'in progress',
    userId: '105'
  }
];

// Categorías de trabajos
export const JOB_CATEGORIES = [
  'Diseño Web',
  'Desarrollo Móvil',
  'Ciencia de Datos',
  'Diseño UI/UX',
  'Gestión de Proyectos',
  'Desarrollo Frontend',
  'Desarrollo Backend',
  'Marketing Digital'
];

// Lista de habilidades
export const SKILLS_LIST = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'Swift',
  'Kotlin',
  'Java',
  'UI Design',
  'UX Design',
  'Figma',
  'Adobe XD',
  'Project Management',
  'Agile',
  'Scrum',
  'Machine Learning',
  'TensorFlow',
  'Data Analysis',
  'Leadership'
];
