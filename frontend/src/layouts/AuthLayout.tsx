import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg transition-colors duration-300 relative overflow-hidden px-4">
      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-brand-primary/10 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-secondary/10 blur-3xl animate-pulse-glow" />

      {/* Main card box */}
      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl dark:bg-dark-card dark:border-dark-border p-8 backdrop-blur-md">
        {children}
      </div>
    </div>
  );
};
