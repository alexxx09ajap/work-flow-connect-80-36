
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  updateUserProfile as updateFirebaseUserProfile 
} from "@/lib/firebaseUtils";

export type UserType = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  role: 'freelancer' | 'client';
  savedJobs?: string[];
};

interface AuthContextType {
  currentUser: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserType>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setCurrentUser({
              id: user.uid,
              ...userDoc.data() as Omit<UserType, "id">
            });
          } else {
            // If no Firestore document, create basic user object
            setCurrentUser({
              id: user.uid,
              name: user.displayName || "",
              email: user.email || "",
              photoURL: user.photoURL || undefined,
              role: "freelancer"
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error al cargar los datos del usuario"
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      setCurrentUser(user);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a WorkFlowConnect",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: error instanceof Error ? error.message : "Error al iniciar sesión",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const user = await registerUser(email, password, name);
      setCurrentUser(user);
      toast({
        title: "Registro exitoso",
        description: "¡Bienvenido a WorkFlowConnect!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: error instanceof Error ? error.message : "Error al registrar",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cerrar sesión"
      });
    }
  };

  const updateUserProfile = async (data: Partial<UserType>) => {
    if (!currentUser) throw new Error('No hay usuario autenticado');
    
    try {
      await updateFirebaseUserProfile(currentUser.id, data);
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar el perfil"
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        loading, 
        login, 
        register, 
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
