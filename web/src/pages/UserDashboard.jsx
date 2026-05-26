import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Video, FileText, Bell, ArrowRight, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useParticipationRate } from '@/hooks/useParticipationRate';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const { rate, stats, loading: statsLoading } = useParticipationRate(currentUser?.id);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentVlogs, setRecentVlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const now = new Date().toISOString();
        
        const [eventsRes, vlogsRes] = await Promise.all([
          pb.collection('events').getList(1, 4, { filter: `date >= "${now}"`, sort: 'date', $autoCancel: false }),
          pb.collection('vlogs').getList(1, 2, { sort: '-created_at', $autoCancel: false })
        ]);

        setUpcomingEvents(eventsRes.items);
        setRecentVlogs(vlogsRes.items);
      } catch (error) {
        console.error('Error fetching user dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Helmet><title>マイページ - Dance Group Management</title></Helmet>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">マイページ</h1>
            <p className="text-muted-foreground mt-1">ようこそ、{currentUser?.name}さん。今日も楽しく踊りましょう！</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-full bg-background">
              <Link to="/memos"><FileText className="w-4 h-4 mr-2" />マイメモ</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/profile"><TrendingUp className="w-4 h-4 mr-2" />参加実績</Link>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="bg-primary/10 px-6 py-4 border-b border-primary/10 flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2 text-primary-foreground"><Calendar className="w-5 h-5 text-primary" /> 今後の予定</CardTitle>
                <Link to="/calendar" className="text-sm font-medium text-primary hover:underline">すべて見る</Link>
              </div>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 text-center text-muted-foreground">読み込み中...</div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="divide-y">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`rounded-xl p-3 text-center min-w-[4rem] ${event.type === 'practice' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            <div className="text-xs font-bold uppercase">{format(new Date(event.date), 'MMM')}</div>
                            <div className="text-xl font-black leading-none mt-1">{format(new Date(event.date), 'dd')}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${event.type === 'practice' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                {event.type === 'practice' ? '練習' : 'イベント'}
                              </span>
                              <span className="text-xs text-muted-foreground">{event.time || '時間未定'}</span>
                            </div>
                            <h4 className="font-bold text-base">{event.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                          </div>
                        </div>
                        <Button asChild variant="secondary" className="shrink-0 rounded-xl">
                          <Link to={`/${event.type === 'practice' ? 'practices' : 'events'}/${event.id}`}>詳細・出欠</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-foreground">予定されているイベントはありません</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><Video className="w-5 h-5 text-primary" /> 最新のVLOG</CardTitle>
                <Link to="/vlogs" className="text-sm font-medium text-primary hover:underline">すべて見る</Link>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4 pt-4">
                {recentVlogs.map(vlog => (
                  <Link key={vlog.id} to={`/vlogs/${vlog.id}`} className="group block">
                    <div className="aspect-video bg-muted rounded-xl overflow-hidden mb-3 relative">
                      {vlog.thumbnail_url ? (
                        <img src={vlog.thumbnail_url} alt={vlog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/20 text-secondary group-hover:bg-secondary/30 transition-colors">
                          <Video className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{vlog.title}</h4>
                  </Link>
                ))}
                {recentVlogs.length === 0 && !loading && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">VLOGがありません</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-sm bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <h3 className="font-medium opacity-90 mb-4">あなたの参加状況</h3>
                <div className="flex items-end gap-4 mb-6">
                  <div className="text-5xl font-black tabular-nums tracking-tighter">{statsLoading ? '-' : rate}%</div>
                  <div className="pb-1 opacity-90 text-sm">参加率</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-black/10 rounded-lg p-3">
                    <div className="opacity-80 mb-1">出席</div>
                    <div className="font-bold text-xl">{statsLoading ? '-' : stats.attended}回</div>
                  </div>
                  <div className="bg-black/10 rounded-lg p-3">
                    <div className="opacity-80 mb-1">予定</div>
                    <div className="font-bold text-xl">{statsLoading ? '-' : stats.registered}回</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Bell className="w-5 h-5 text-primary" /> お知らせ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button asChild variant="outline" className="w-full justify-between rounded-xl h-12">
                    <Link to="/notifications">
                      <span>すべてのお知らせを見る</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;