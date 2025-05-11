
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataProvider';
import { JobProvider } from '@/contexts/JobContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import JobsPage from '@/pages/JobsPage';
import JobDetail from '@/pages/JobDetail';
import CreateJobPage from '@/pages/CreateJobPage';
import ChatsPage from '@/pages/ChatsPage';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import ProfilePage from '@/pages/ProfilePage';
import UserProfile from '@/pages/UserProfile';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <JobProvider>
              <ChatProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/jobs" element={
                    <ProtectedRoute>
                      <JobsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/jobs/:jobId" element={
                    <ProtectedRoute>
                      <JobDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/jobs/create" element={
                    <ProtectedRoute>
                      <CreateJobPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/chats" element={
                    <ProtectedRoute>
                      <ChatsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/users/:userId" element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </ChatProvider>
            </JobProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
