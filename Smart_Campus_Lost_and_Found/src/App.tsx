import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import AuthPage from '@/pages/AuthPage';
import Layout, { type Page } from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Browse from '@/pages/Browse';
import ReportForm from '@/pages/ReportForm';
import MyReports from '@/pages/MyReports';
import MyClaims from '@/pages/MyClaims';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminClaims from '@/pages/AdminClaims';
import AdminItems from '@/pages/AdminItems';
import AdminUsers from '@/pages/AdminUsers';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'browse': return <Browse />;
      case 'report-lost': return <ReportForm type="lost" onNavigate={setCurrentPage} />;
      case 'report-found': return <ReportForm type="found" onNavigate={setCurrentPage} />;
      case 'my-reports': return <MyReports />;
      case 'my-claims': return <MyClaims />;
      case 'admin-dashboard': return <AdminDashboard />;
      case 'admin-claims': return <AdminClaims />;
      case 'admin-items': return <AdminItems />;
      case 'admin-users': return <AdminUsers />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  // Guard admin pages
  if (currentPage.startsWith('admin') && profile.role !== 'admin') {
    setCurrentPage('dashboard');
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
