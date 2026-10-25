import React from 'react';
import { HashRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AppRoutes } from './routes/AppRoutes';

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname === '/admin';

  return (
    <div className="flex flex-col min-h-screen bg-warm-50 text-stone-900 selection:bg-emerald-100 selection:text-forest-900">
      <Navbar />
      {isDashboard && (
        <div className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-950 border-b border-amber-200" role="note">
          Demo mode: data is stored in this browser. Supabase and Express are not deployed for this demo.
        </div>
      )}
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
