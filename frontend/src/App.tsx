import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import { AppLayout } from './layouts/AppLayout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Problems } from './pages/Problems';
import { SolveWorkspace } from './pages/SolveWorkspace';
import { StriverSheet } from './pages/StriverSheet';
import { MockQuizzes } from './pages/MockQuizzes';
import { Settings } from './pages/Settings';
import { VivaPrep } from './pages/VivaPrep';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

// Protected Route Guard Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg text-brand-primary">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Workspace Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/problems" 
                element={
                  <ProtectedRoute>
                    <Problems />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/problems/:slug" 
                element={
                  <ProtectedRoute>
                    <SolveWorkspace />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/striver" 
                element={
                  <ProtectedRoute>
                    <StriverSheet />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mock" 
                element={
                  <ProtectedRoute>
                    <MockQuizzes />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/viva" 
                element={
                  <ProtectedRoute>
                    <VivaPrep />
                  </ProtectedRoute>
                } 
              />

              {/* Default Redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
