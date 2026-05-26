import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, Settings, LogOut, Bell, Briefcase, Video, CalendarDays } from 'lucide-react';
import RoleBadge from '@/components/RoleBadge';
import pb from '@/lib/pocketbaseClient';

const Header = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const fetchNotifications = async () => {
        try {
          const records = await pb.collection('notifications').getList(1, 10, {
            sort: '-created',
            $autoCancel: false
          });
          const unread = records.items.filter(n => !n.read_by?.includes(currentUser.id));
          setUnreadCount(unread.length);
        } catch (error) {}
      };
      fetchNotifications();
    }
  }, [isAuthenticated, currentUser]);

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const avatarUrl = currentUser?.profile_picture ? pb.files.getUrl(currentUser, currentUser.profile_picture, { thumb: '100x100' }) : null;
  const isStaff = currentUser?.role === '三役' || currentUser?.role === 'スタッフ';

  const NavLinks = () => (
    <>
      <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">ホーム</Link>
      <Link to="/events" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">イベント</Link>
      <Link to="/practices" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">練習</Link>
      <Link to="/calendar" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">カレンダー</Link>
      <Link to="/annual-schedule" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">年間予定</Link>
      <Link to="/vlogs" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1"><Video className="w-4 h-4"/> VLOG</Link>
      
      {isStaff ? (
        <>
          <Link to="/articles" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">ブログ</Link>
          <Link to="/operations/progress" className="ml-2 flex items-center px-3 py-2 rounded-md text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
            <Briefcase className="w-4 h-4 mr-2" /> 運営
          </Link>
        </>
      ) : (
        <>
          <Link to="/memos" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">マイメモ</Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b glass-panel">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <span className="text-primary-foreground font-extrabold text-xl">D</span>
              </div>
              <span className="font-bold tracking-tight hidden sm:inline-block">DanceGroup</span>
            </Link>

            {isAuthenticated && (
              <nav className="hidden xl:flex items-center gap-1">
                <NavLinks />
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" asChild className="relative rounded-full">
                  <Link to="/notifications">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background" />
                    )}
                  </Link>
                </Button>

                <div className="hidden md:flex items-center pl-2 border-l border-border h-8 gap-3">
                  <RoleBadge role={currentUser?.role} size="sm" />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 ml-1 hover:opacity-80 transition-opacity">
                      <Avatar className="h-10 w-10 rounded-xl border shadow-sm">
                        <AvatarImage src={avatarUrl} alt={currentUser?.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(currentUser?.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
                        <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to="/profile" className="cursor-pointer"><User className="mr-2 h-4 w-4" />プロフィール</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/settings" className="cursor-pointer"><Settings className="mr-2 h-4 w-4" />設定</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive"><LogOut className="mr-2 h-4 w-4" />ログアウト</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/login">ログイン</Link></Button>
                <Button asChild size="sm" className="rounded-full px-6"><Link to="/signup">新規登録</Link></Button>
              </div>
            )}
          </div>
        </div>

        {mobileMenuOpen && isAuthenticated && (
          <div className="xl:hidden py-4 border-t">
            <nav className="flex flex-col gap-1">
              <NavLinks />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;