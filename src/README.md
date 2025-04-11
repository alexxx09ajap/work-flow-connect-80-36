
# WorkFlowConnect - Project Structure and Documentation

## Project Overview
WorkFlowConnect is a platform that connects freelancers with clients, allowing them to find work opportunities, communicate through chat, and manage profiles.

## Key Files and Directories Structure

### Firebase Configuration and Database
- `src/lib/firebase.ts` - Firebase initialization and configuration
- `src/lib/firebaseUtils.ts` - Firebase utility functions for CRUD operations
- `src/lib/initializeFirebase.ts` - Firebase data initialization

### Context Providers
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/contexts/ChatContext.tsx` - Chat functionality and real-time messaging
- `src/contexts/JobContext.tsx` - Job listings management
- `src/contexts/DataContext.tsx` - Global data management
- `src/contexts/ThemeContext.tsx` - Theme management

### Main Pages
- `src/pages/Index.tsx` - Landing page
- `src/pages/Login.tsx` - Login page
- `src/pages/Register.tsx` - Registration page
- `src/pages/Dashboard.tsx` - User dashboard
- `src/pages/JobsPage.tsx` - Job listings page
- `src/pages/JobDetail.tsx` - Individual job details
- `src/pages/CreateJobPage.tsx` - Create new job page
- `src/pages/ChatsPage.tsx` - Chat/messaging interface
- `src/pages/ProfilePage.tsx` - User profile management
- `src/pages/UserProfile.tsx` - View other users' profiles

### Components
- `src/components/Layout/MainLayout.tsx` - Main application layout
- `src/components/ui/` - UI components based on shadcn/ui
- `src/components/JobCard.tsx` - Job listing card
- `src/components/Comments/` - Comment-related components
- `src/components/EditJobForm.tsx` - Edit job form
- Various other utility and UI components

### Entry Points
- `src/main.tsx` - Application entry point
- `src/App.tsx` - Main routing and app configuration

### Utilities and Hooks
- `src/hooks/` - Custom React hooks
- `src/lib/utils.ts` - Utility functions

## Real-time Communication
Real-time chat functionality is implemented using Firebase's Firestore listeners (onSnapshot) in the ChatContext.tsx file, which provides WebSocket-like functionality without requiring Socket.io.
