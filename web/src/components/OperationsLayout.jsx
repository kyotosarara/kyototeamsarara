import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const OperationsLayout = () => {
  const { currentUser, initialLoading } = useAuth();
  const location = useLocation();

  if (initialLoading) return <div>Loading...</div>;

  if (!currentUser || (currentUser.role !== 'スタッフ' && currentUser.role !== '三役')) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { path: '/operations/budget', label: '予算管理' },
    { path: '/operations/equipment', label: '備品管理' },
    { path: '/operations/staff', label: 'スタッフ管理' },
    { path: '/operations/progress', label: '振り落とし進捗' },
    { path: '/operations/meetings', label: '会議録' }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <Sidebar className="hidden md:block w-64 shrink-0" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        {/* Operations Sub-Navigation */}
        <div className="bg-card border-b px-4 py-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex space-x-2 max-w-7xl mx-auto">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OperationsLayout;