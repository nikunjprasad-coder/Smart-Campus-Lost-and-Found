import { useAuth } from '@/lib/auth';
import { GraduationCap, Search, LayoutDashboard, PlusCircle, ClipboardList, LogOut, Menu, X, ShieldCheck, User as UserIcon, Users } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type Page = 'dashboard' | 'browse' | 'report-lost' | 'report-found' | 'my-claims' | 'my-reports' | 'admin-dashboard' | 'admin-claims' | 'admin-items' | 'admin-users';

type Props = {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

export default function Layout({ children, currentPage, onNavigate }: Props) {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = profile?.role === 'admin';

  const userNav: { key: Page; label: string; icon: typeof Search }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'browse', label: 'Browse Items', icon: Search },
    { key: 'report-lost', label: 'Report Lost', icon: PlusCircle },
    { key: 'report-found', label: 'Report Found', icon: PlusCircle },
    { key: 'my-reports', label: 'My Reports', icon: ClipboardList },
    { key: 'my-claims', label: 'My Claims', icon: ClipboardList },
  ];

  const adminNav: { key: Page; label: string; icon: typeof Search }[] = [
    { key: 'admin-dashboard', label: 'Admin Panel', icon: ShieldCheck },
    { key: 'admin-claims', label: 'Manage Claims', icon: ClipboardList },
    { key: 'admin-items', label: 'Manage Items', icon: LayoutDashboard },
    { key: 'admin-users', label: 'Manage Users', icon: Users },
  ];

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-800 truncate">Campus Lost&Found</h1>
              <p className="text-xs text-slate-500">Smart Recovery</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </div>
          {userNav.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleNav(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                currentPage === key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </button>
          ))}

          {isAdmin && (
            <>
              <div className="px-3 py-2 mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Administration
              </div>
              {adminNav.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleNav(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    currentPage === key
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5 text-slate-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-700 truncate">{profile?.full_name}</p>
              <p className="text-xs text-slate-500 truncate">
                {isAdmin ? 'Administrator' : 'Student'}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Campus L&F</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export type { Page };
