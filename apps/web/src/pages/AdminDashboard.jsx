import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Wallet, Package, CheckSquare, MessageSquare, ArrowRight, Activity } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    pendingTasks: 0,
    activeBudgets: 0,
    equipmentIssues: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const now = new Date().toISOString();
        
        const [eventsRes, tasksRes, budgetsRes, eqRes] = await Promise.all([
          pb.collection('events').getList(1, 5, { filter: `date >= "${now}"`, sort: 'date', $autoCancel: false }),
          pb.collection('tasks').getList(1, 1, { filter: `status != "completed"`, $autoCancel: false }),
          pb.collection('budgets').getList(1, 1, { filter: `status = "approved"`, $autoCancel: false }),
          pb.collection('equipment').getList(1, 1, { filter: `condition != "good"`, $autoCancel: false })
        ]);

        setStats({
          upcomingEvents: eventsRes.totalItems,
          pendingTasks: tasksRes.totalItems,
          activeBudgets: budgetsRes.totalItems,
          equipmentIssues: eqRes.totalItems
        });
        setRecentEvents(eventsRes.items);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, link }) => (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold tabular-nums">{value}</h3>
        </div>
        {link && (
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to={link}><ArrowRight className="w-4 h-4" /></Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Helmet><title>運営ダッシュボード - Dance Group Management</title></Helmet>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">運営ダッシュボード</h1>
          <p className="text-muted-foreground mt-1">ようこそ、{currentUser?.name}さん。グループの運営状況を確認しましょう。</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl"></div>)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="今後のイベント" value={stats.upcomingEvents} icon={Calendar} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" link="/events" />
              <StatCard title="未完了タスク" value={stats.pendingTasks} icon={CheckSquare} colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" link="/operations/progress" />
              <StatCard title="進行中の予算" value={stats.activeBudgets} icon={Wallet} colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" link="/operations/budget" />
              <StatCard title="要対応の備品" value={stats.equipmentIssues} icon={Package} colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" link="/operations/equipment" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> 運営メニュー</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                    {[
                      { label: '予算管理', icon: Wallet, path: '/operations/budget' },
                      { label: '備品管理', icon: Package, path: '/operations/equipment' },
                      { label: 'スタッフ管理', icon: Users, path: '/operations/staff' },
                      { label: '進捗管理', icon: CheckSquare, path: '/operations/progress' },
                      { label: '会議録', icon: MessageSquare, path: '/operations/meetings' },
                      { label: 'ブログ管理', icon: Calendar, path: '/articles' },
                    ].map((item, i) => (
                      <Link key={i} to={item.path} className="flex flex-col items-center justify-center p-6 bg-muted/30 hover:bg-primary/5 border rounded-2xl transition-colors group">
                        <item.icon className="w-8 h-8 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">直近の予定</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentEvents.length > 0 ? recentEvents.map(event => (
                      <div key={event.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="bg-primary/10 text-primary rounded-lg p-2 text-center min-w-[3rem]">
                          <div className="text-xs font-bold uppercase">{format(new Date(event.date), 'MMM')}</div>
                          <div className="text-lg font-black leading-none">{format(new Date(event.date), 'dd')}</div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm line-clamp-1">{event.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{event.time || '時間未定'} • {event.location}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-4">予定されているイベントはありません</p>
                    )}
                    <Button asChild variant="outline" className="w-full mt-2">
                      <Link to="/calendar">カレンダーを見る</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;