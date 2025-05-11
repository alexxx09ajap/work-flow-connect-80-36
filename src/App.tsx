
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { JobProvider } from '@/contexts/JobContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { Toaster } from '@/components/ui/toaster';
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
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <JobProvider>
            <ChatProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/jobs/:jobId" element={<JobDetail />} />
                  <Route path="/jobs/create" element={<CreateJobPage />} />
                  <Route path="/chats" element={<ChatsPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/users/:userId" element={<UserProfile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </Router>
            </ChatProvider>
          </JobProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
