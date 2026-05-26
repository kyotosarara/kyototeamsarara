import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Users, Calendar, Link as LinkIcon, Bell, Video, BookOpen, Briefcase, FileText, CalendarDays, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = ({ className }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const navigationItems = [
    { path: '/', label: 'ダッシュボード', icon: Home, roles: ['三役', 'スタッフ', '一般'] },
    { path: '/calendar', label: 'カレンダー', icon: Calendar, roles: ['三役', 'スタッフ', '一般'] },
    { path: '/annual-schedule', label: '年間予定', icon: CalendarDays, roles: ['三役', 'スタッフ', '一般'] },
    { path: '/practices', label: '練習', icon: Users, roles: ['三役', 'スタッフ', '一般'] },
    { path: '/events', label: 'イベント', icon: Calendar, roles: ['三役', 'スタッフ', '一般'] },
    { path: '/vlogs', label: 'Moment VLOG', icon: Video, roles: ['三役', 'スタッフ', '一般'] },
    { path: '/articles', label: 'ブログ', icon: BookOpen, roles: ['三役', 'スタッフ'] },
    { path: '/memos', label: 'マイメモ', icon: FileText, roles: ['一般'] },
    { path: '/notifications', label: 'お知らせ', icon: Bell, roles: ['三役', 'スタッフ', '一般'] },
    { path: '/hp-links', label: 'リンク集', icon: LinkIcon, roles: ['三役', 'スタッフ', '一般'] },
    { path: '/operations/progress', label: '運営 (Operations)', icon: Briefcase, roles: ['三役', 'スタッフ'] },
    { path: '/admin/emails', label: '管理者設定', icon: Shield, roles: ['三役'] },
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(currentUser?.role)
  );

  return (
    <aside className={cn("border-r bg-muted/20 min-h-screen p-4 md:p-6", className)}>
      <nav className="space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", active ? "text-primary-foreground" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;