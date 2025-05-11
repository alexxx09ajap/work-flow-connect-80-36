
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/use-toast";
import { authService, socketService } from '@/services/api';

export type UserType = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  role: 'freelancer' | 'client';
  savedJobs?: string[];
  hourlyRate?: number;
  joinedAt?: number;
};

interface AuthContextType {
  currentUser: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserType>) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<string>;
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

  // Check for existing login on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await authService.verifyToken();
          
          // Transform backend user data to match our frontend UserType
          const user: UserType = {
            id: userData.id.toString(),
            name: userData.username,
            email: userData.email,
            photoURL: userData.avatar,
            role: 'freelancer', // Default role, can be updated later
            joinedAt: new Date(userData.created_at).getTime()
          };
          
          setCurrentUser(user);
          
          // Connect to socket.io
          socketService.connect(token);
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
    
    // Cleanup socket connection on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user, token } = await authService.login(email, password);
      
      // Save token
      localStorage.setItem('auth_token', token);
      
      // Transform backend user data to match our frontend UserType
      const transformedUser: UserType = {
        id: user.id.toString(),
        name: user.username,
        email: user.email,
        photoURL: user.avatar,
        role: 'freelancer', // Default role, can be updated later
        joinedAt: new Date(user.created_at).getTime()
      };
      
      setCurrentUser(transformedUser);
      
      // Connect to socket.io
      socketService.connect(token);
      
      toast({
        title: "Login successful",
        description: "Welcome to WorkFlowConnect",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login error",
        description: "Invalid email or password",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const { user, token } = await authService.register(name, email, password);
      
      // Save token
      localStorage.setItem('auth_token', token);
      
      // Transform backend user data to match our frontend UserType
      const transformedUser: UserType = {
        id: user.id.toString(),
        name: user.username,
        email: user.email,
        photoURL: user.avatar,
        role: 'freelancer', // Default role
        joinedAt: new Date(user.created_at).getTime()
      };
      
      setCurrentUser(transformedUser);
      
      // Connect to socket.io
      socketService.connect(token);
      
      toast({
        title: "Registration successful",
        description: "Welcome to WorkFlowConnect!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration error",
        description: "This email is already in use",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Disconnect from socket
      socketService.disconnect();
      
      // Clear local storage
      localStorage.removeItem('auth_token');
      
      // Clear current user
      setCurrentUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error logging out"
      });
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserType>) => {
    if (!currentUser) throw new Error('No authenticated user');
    
    try {
      // Transform frontend data to match backend expectations
      const backendData = {
        username: data.name,
        avatar: data.photoURL,
        bio: data.bio,
        // Add other fields as needed
      };
      
      const updatedUserData = await authService.updateProfile(backendData);
      
      // Update local user state
      const updatedUser = { 
        ...currentUser,
        name: updatedUserData.username,
        photoURL: updatedUserData.avatar,
        // Update other fields as needed
      };
      
      setCurrentUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your changes have been saved",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error updating profile"
      });
      throw error;
    }
  };

  // Upload profile photo
  const uploadProfilePhoto = async (file: File) => {
    if (!currentUser) throw new Error('No authenticated user');
    
    try {
      // Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      
      // Get base64 data
      const photoURL = base64;
      
      // Update user profile with new photo
      await updateUserProfile({ photoURL });
      
      toast({
        title: "Photo updated",
        description: "Your profile photo has been updated",
      });
      
      return photoURL;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error uploading profile photo"
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
        updateUserProfile,
        uploadProfilePhoto
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
