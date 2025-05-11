
/**
 * Mock Data
 * 
 * Este archivo contiene datos simulados que reemplazan la funcionalidad
 * de Firebase. Incluye usuarios, trabajos, categorías, habilidades y chats.
 */

import { UserType } from '@/contexts/AuthContext';
import { JobType, CommentType } from '@/contexts/JobContext';
import { ChatType, MessageType } from '@/contexts/ChatContext';

// Usuarios simulados
export const MOCK_USERS: UserType[] = [
  {
    id: '1',
    name: 'Carlos Rodriguez',
    email: 'carlos@example.com',
    bio: 'Desarrollador web con 5 años de experiencia en React y Node.js',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    role: 'freelancer',
    photoURL: 'https://randomuser.me/api/portraits/men/1.jpg',
    joinedAt: Date.now() - 15000000000
  },
  {
    id: '2',
    name: 'Ana Martinez',
    email: 'ana@example.com',
    bio: 'Diseñadora UX/UI especializada en experiencias móviles',
    skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD'],
    role: 'freelancer',
    photoURL: 'https://randomuser.me/api/portraits/women/1.jpg',
    joinedAt: Date.now() - 10000000000
  },
  {
    id: '3',
    name: 'Empresa ABC',
    email: 'contact@abc.com',
    bio: 'Empresa de desarrollo de software buscando talentos',
    role: 'client',
    photoURL: 'https://logo.clearbit.com/acme.com',
    savedJobs: ['job1', 'job2'],
    joinedAt: Date.now() - 20000000000
  }
];

// Comentarios simulados
const MOCK_COMMENTS: CommentType[] = [
  {
    id: 'comment1',
    jobId: 'job1',
    userId: '1',
    userName: 'Carlos Rodriguez',
    userPhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
    content: 'Me interesa este proyecto. ¿Podemos hablar de los detalles?',
    timestamp: Date.now() - 500000,
    replies: []
  },
  {
    id: 'comment2',
    jobId: 'job1',
    userId: '2',
    userName: 'Ana Martinez',
    userPhoto: 'https://randomuser.me/api/portraits/women/1.jpg',
    content: '¿Cuál es el plazo de entrega para este proyecto?',
    timestamp: Date.now() - 300000,
    replies: [
      {
        id: 'reply1',
        commentId: 'comment2',
        userId: '3',
        userName: 'Empresa ABC',
        userPhoto: 'https://logo.clearbit.com/acme.com',
        content: 'Necesitamos tenerlo listo en 2 semanas',
        timestamp: Date.now() - 200000
      }
    ]
  }
];

// Trabajos simulados
export const MOCK_JOBS: JobType[] = [
  {
    id: 'job1',
    title: 'Desarrollo de sitio web responsive',
    description: 'Necesitamos desarrollar un sitio web responsive para nuestra empresa. El sitio debe ser moderno, rápido y fácil de usar.',
    budget: 1500,
    category: 'Desarrollo Web',
    skills: ['JavaScript', 'React', 'HTML/CSS'],
    userId: '3',
    userName: 'Empresa ABC',
    userPhoto: 'https://logo.clearbit.com/acme.com',
    timestamp: Date.now() - 1000000,
    status: 'open',
    comments: [MOCK_COMMENTS[0], MOCK_COMMENTS[1]],
    likes: ['1', '2']
  },
  {
    id: 'job2',
    title: 'Diseño de interfaz para aplicación móvil',
    description: 'Buscamos un diseñador UX/UI para crear la interfaz de nuestra nueva aplicación móvil de fitness.',
    budget: 1200,
    category: 'Diseño UX/UI',
    skills: ['UI Design', 'UX Research', 'Figma'],
    userId: '3',
    userName: 'Empresa ABC',
    userPhoto: 'https://logo.clearbit.com/acme.com',
    timestamp: Date.now() - 2000000,
    status: 'open',
    comments: [],
    likes: ['2']
  },
  {
    id: 'job3',
    title: 'Desarrollo de APIs RESTful',
    description: 'Necesitamos un desarrollador backend para crear APIs RESTful para nuestra aplicación web existente.',
    budget: 2000,
    category: 'Desarrollo Web',
    skills: ['Node.js', 'Express', 'MongoDB', 'API Design'],
    userId: '3',
    userName: 'Empresa ABC',
    userPhoto: 'https://logo.clearbit.com/acme.com',
    timestamp: Date.now() - 3000000,
    status: 'in-progress',
    comments: [],
    likes: []
  }
];

// Mensajes simulados
const MOCK_MESSAGES: MessageType[] = [
  {
    id: 'msg1',
    senderId: '1',
    content: 'Hola, estoy interesado en tu proyecto de desarrollo web',
    timestamp: Date.now() - 400000
  },
  {
    id: 'msg2',
    senderId: '3',
    content: 'Gracias por tu interés. ¿Tienes experiencia en React?',
    timestamp: Date.now() - 350000
  },
  {
    id: 'msg3',
    senderId: '1',
    content: 'Sí, tengo 5 años de experiencia trabajando con React y aplicaciones responsive',
    timestamp: Date.now() - 300000
  }
];

// Chats simulados
export const MOCK_CHATS: ChatType[] = [
  {
    id: 'chat1',
    name: '',
    participants: ['1', '3'],
    messages: MOCK_MESSAGES,
    isGroup: false,
    lastMessage: MOCK_MESSAGES[2]
  },
  {
    id: 'chat2',
    name: 'Proyecto de Diseño',
    participants: ['1', '2', '3'],
    messages: [
      {
        id: 'msg4',
        senderId: '3',
        content: 'Bienvenidos al grupo de diseño del proyecto',
        timestamp: Date.now() - 200000
      }
    ],
    isGroup: true,
    lastMessage: {
      id: 'msg4',
      senderId: '3',
      content: 'Bienvenidos al grupo de diseño del proyecto',
      timestamp: Date.now() - 200000
    }
  }
];

// Categorías de trabajos
export const JOB_CATEGORIES = [
  'Desarrollo Web',
  'Diseño UX/UI',
  'Desarrollo Móvil',
  'Marketing Digital',
  'Redacción y Traducción',
  'Consultoría',
  'Administración de Sistemas',
  'Análisis de Datos'
];

// Lista de habilidades
export const SKILLS_LIST = [
  'JavaScript',
  'React',
  'Node.js',
  'HTML/CSS',
  'Python',
  'UI Design',
  'UX Research',
  'Figma',
  'Adobe XD',
  'Photoshop',
  'React Native',
  'Flutter',
  'Swift',
  'Kotlin',
  'SEO',
  'SEM',
  'Social Media',
  'Content Writing',
  'Translation',
  'WordPress',
  'PHP',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'DevOps',
  'Docker',
  'Machine Learning'
];

// Usuario actual simulado (para simular la autenticación)
export let CURRENT_USER: UserType | null = {
  id: '1',
  name: 'Carlos Rodriguez',
  email: 'carlos@example.com',
  bio: 'Desarrollador web con 5 años de experiencia en React y Node.js',
  skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
  role: 'freelancer',
  photoURL: 'https://randomuser.me/api/portraits/men/1.jpg',
  savedJobs: ['job2'],
  joinedAt: Date.now() - 15000000000
};

// Identificadores de trabajos guardados por el usuario actual
export let SAVED_JOBS: string[] = CURRENT_USER?.savedJobs || [];
