
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { DataProvider } from './contexts/DataContext.tsx'
import { JobProvider } from './contexts/JobContext.tsx'
import { ChatProvider } from './contexts/ChatContext.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { initializeFirebaseData } from './lib/firebaseUtils'

// Initialize Firebase data before rendering the app
initializeFirebaseData().then(() => {
  console.log("Firebase initialization complete or already initialized");
}).catch(error => {
  console.error("Firebase initialization failed:", error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <JobProvider>
            <ChatProvider>
              <App />
              <Toaster />
            </ChatProvider>
          </JobProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
