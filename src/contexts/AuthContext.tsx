
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '@/types';
import { useToast } from '@/components/ui/use-toast';

// Define actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'VERIFY_TOKEN_START' }
  | { type: 'VERIFY_TOKEN_SUCCESS'; payload: { user: User } }
  | { type: 'VERIFY_TOKEN_FAILURE'; payload: string };

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
};

// Reducer for updating state
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
    case 'VERIFY_TOKEN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
        isAuthenticated: true,
      };
    case 'VERIFY_TOKEN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        loading: false,
        error: null,
        isAuthenticated: true,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
    case 'VERIFY_TOKEN_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    default:
      return state;
  }
};

// Create context
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Determine base URL based on environment
const API_URL = 'http://localhost:5000/api';

// Context provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();

  // Verify if user is already authenticated when page loads
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        console.log("Verifying token:", token);
        const response = await fetch(`${API_URL}/auth/verify`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Verification successful:", data);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: data.user, token }
          });
        } else {
          console.log("Invalid token");
          // If token is not valid, clear storage
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error verifying authentication:', error);
      }
    };

    checkAuthStatus();
  }, []);

  // Function to login
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: data.user, token: data.token }
        });
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: data.message || 'Error logging in'
        });
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || 'Error logging in',
        });
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: 'Error connecting to server'
      });
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to server",
      });
    }
  };

  // Function to register
  const register = async (username: string, email: string, password: string) => {
    dispatch({ type: 'REGISTER_START' });

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({
          type: 'REGISTER_SUCCESS',
          payload: { user: data.user, token: data.token }
        });
        toast({
          title: "Registration successful!",
          description: "Your account has been created successfully.",
        });
      } else {
        dispatch({
          type: 'REGISTER_FAILURE',
          payload: data.message || 'Error registering'
        });
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || 'Error registering',
        });
      }
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: 'Error connecting to server'
      });
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to server",
      });
    }
  };

  // Function to logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
