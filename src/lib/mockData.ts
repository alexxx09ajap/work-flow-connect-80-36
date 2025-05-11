
import { JobType } from '@/contexts/JobContext';
import { UserType, ChatType, MessageType } from '@/types';

// Job categories
export const JOB_CATEGORIES = [
  "Diseño Web", "Desarrollo Frontend", "Desarrollo Backend", "Aplicaciones Móviles",
  "UX/UI", "Marketing Digital", "SEO", "Redacción de Contenido", "Traducción", 
  "Edición de Video", "Ilustración", "Análisis de Datos", "Administración de Sistemas",
  "Soporte Técnico"
];

// Skills list
export const SKILLS_LIST = [
  "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js", "Node.js", 
  "PHP", "Python", "Ruby", "Java", "Swift", "Kotlin", "Flutter", "React Native",
  "AWS", "Docker", "Kubernetes", "SQL", "MongoDB", "Firebase", "GraphQL", "REST API",
  "WordPress", "Shopify", "Figma", "Adobe XD", "Photoshop", "Illustrator", "After Effects",
  "SEO", "Google Ads", "Facebook Ads", "Email Marketing", "Content Writing", "Copywriting",
  "Data Analysis", "Excel", "Power BI", "Tableau", "Machine Learning", "AI"
];

// Mock users
export const MOCK_USERS: UserType[] = [
  {
    id: "1",
    name: "Ana García",
    email: "ana@example.com",
    photoURL: "https://randomuser.me/api/portraits/women/1.jpg",
    role: "freelancer",
    bio: "Diseñadora web con 5 años de experiencia especializada en UX/UI",
    skills: ["HTML", "CSS", "JavaScript", "React", "Figma"],
    hourlyRate: 25,
    isOnline: true
  },
  {
    id: "2",
    name: "Luis Méndez",
    email: "luis@example.com",
    photoURL: "https://randomuser.me/api/portraits/men/2.jpg",
    role: "freelancer",
    bio: "Desarrollador Full Stack con experiencia en aplicaciones React y Node.js",
    skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
    hourlyRate: 30,
    isOnline: false
  },
  {
    id: "3",
    name: "Sofía Torres",
    email: "sofia@example.com",
    photoURL: "https://randomuser.me/api/portraits/women/3.jpg",
    role: "client",
    bio: "Dueña de startup de tecnología buscando developers talentosos",
    isOnline: true
  }
];

// Mock jobs
export const MOCK_JOBS: JobType[] = [
  {
    id: "1",
    title: "Desarrollo de landing page para startup",
    description: "Necesito una landing page moderna y responsive que convierta visitantes en leads. Debe tener formulario de contacto, integración con MailChimp y optimización SEO.",
    budget: 500,
    category: "Desarrollo Frontend",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    status: "open",
    userId: "3",
    createdAt: new Date(2025, 3, 15),
  },
  {
    id: "2",
    title: "Rediseño de interfaz de usuario para app móvil",
    description: "Buscamos rediseñar la interfaz de nuestra aplicación móvil de fitness para mejorar la experiencia de usuario y aumentar la retención. Necesitamos mockups en Figma y colaboración con nuestro equipo de desarrollo.",
    budget: 800,
    category: "UX/UI",
    skills: ["Figma", "UX Design", "UI Design", "Mobile Design"],
    status: "open",
    userId: "3",
    createdAt: new Date(2025, 3, 18),
  }
];

// Mock chats
export const MOCK_CHATS: ChatType[] = [
  {
    id: "1",
    name: "",
    isGroup: false,
    participants: ["1", "3"],
    lastMessage: {
      content: "Me interesa tu perfil para el proyecto",
      timestamp: Date.now() - 3600000 // 1 hour ago
    }
  },
  {
    id: "2",
    name: "Proyecto Landing Page",
    isGroup: true,
    participants: ["1", "2", "3"],
    lastMessage: {
      content: "¿Cuándo podemos tener una reunión para discutir los detalles?",
      timestamp: Date.now() - 86400000 // 1 day ago
    }
  }
];

// Mock messages
export const MOCK_MESSAGES: Record<string, MessageType[]> = {
  "1": [
    {
      id: "101",
      content: "Hola Ana, me interesa tu perfil para el proyecto de landing page",
      timestamp: Date.now() - 7200000, // 2 hours ago
      senderId: "3",
      senderName: "Sofía Torres",
      read: true
    },
    {
      id: "102",
      content: "Hola Sofía, gracias por contactarme. Me encantaría saber más sobre el proyecto",
      timestamp: Date.now() - 3600000, // 1 hour ago
      senderId: "1",
      senderName: "Ana García",
      read: true
    },
    {
      id: "103",
      content: "Me interesa tu perfil para el proyecto",
      timestamp: Date.now() - 3600000, // 1 hour ago
      senderId: "3",
      senderName: "Sofía Torres",
      read: false
    }
  ],
  "2": [
    {
      id: "201",
      content: "Bienvenidos al grupo del proyecto de landing page",
      timestamp: Date.now() - 172800000, // 2 days ago
      senderId: "3",
      senderName: "Sofía Torres",
      read: true
    },
    {
      id: "202",
      content: "Gracias por incluirme, estoy emocionado por colaborar",
      timestamp: Date.now() - 162800000, // 45 hours ago
      senderId: "2",
      senderName: "Luis Méndez",
      read: true
    },
    {
      id: "203",
      content: "¿Cuándo podemos tener una reunión para discutir los detalles?",
      timestamp: Date.now() - 86400000, // 1 day ago
      senderId: "1",
      senderName: "Ana García",
      read: false
    }
  ]
};
