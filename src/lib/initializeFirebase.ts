
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Sample job categories
const SAMPLE_JOB_CATEGORIES = [
  'Desarrollo Web',
  'Diseño UX/UI',
  'Desarrollo Móvil',
  'Marketing Digital',
  'Redacción y Traducción',
  'Consultoría',
  'Administración de Sistemas',
  'Análisis de Datos'
];

// Sample skills list
const SAMPLE_SKILLS = [
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

// Function to initialize Firebase with sample data
export const initializeFirebaseData = async () => {
  try {
    // Check if metadata collection exists
    const metadataDoc = await getDoc(doc(db, "metadata", "initialized"));
    if (metadataDoc.exists()) {
      console.log("Firebase already initialized with sample data");
      return;
    }

    console.log("Initializing Firebase with sample data...");

    // Add job categories
    await setDoc(doc(db, "metadata", "jobCategories"), {
      categories: SAMPLE_JOB_CATEGORIES
    });

    // Add skills list
    await setDoc(doc(db, "metadata", "skills"), {
      skills: SAMPLE_SKILLS
    });

    // Mark as initialized
    await setDoc(doc(db, "metadata", "initialized"), {
      timestamp: new Date(),
      initialized: true
    });

    console.log("Firebase initialized with sample data successfully!");
  } catch (error) {
    console.error("Error initializing Firebase data:", error);
  }
};
