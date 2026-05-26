import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Calendar, MapPin, JapaneseYen, Clock, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const EventDetailPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const record = await pb.collection('events').getOne(id, { $autoCancel: false });
        setEvent(record);

        if (currentUser) {
          const regRecords = await pb.collection('registrations').getList(1, 1, {
            filter: `event_id="${id}" && user_id="${currentUser.id}"`,
            $autoCancel: false
          });
          if (regRecords.items.length > 0) {
            setRegistration(regRecords.items[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser]);

  const handleRegister = async (status) => {
    setRegistering(true);
    try {
      if (registration) {
        const updated = await pb.collection('registrations').update(registration.id, { status }, { $autoCancel: false });
        setRegistration(updated);
        toast.success(`ステータスを「${status === 'attended' ? '出席' : status === 'absent' ? '欠席' : '予定'}」に更新しました`);
      } else {
        const newReg = await pb.collection('registrations').create({
          user_id: currentUser.id,
          event_id: id,
          status
        }, { $autoCancel: false });
        setRegistration(newReg);
        toast.success('参加登録しました');
      }
    } catch (error) {
      toast.error('処理に失敗しました');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">見つかりません</div>;

  const isStaff = currentUser?.role === 'スタッフ' || currentUser?.role === '三役';

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>{`${event.name} - Dance Group Management`}</title></Helmet>
      <Header />
      <main className="flex-1 py-8 container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6 hover:bg-muted rounded-full">
          <Link to={event.type === 'practice' ? '/practices' : '/events'}><ArrowLeft className="mr-2 h-4 w-4" />戻る</Link>
        </Button>

        <div className="bg-card rounded-3xl shadow-md border overflow-hidden border-t-[6px] border-t-amber-500">
          <div className="p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${event.type === 'practice' ? 'bg-[hsl(var(--calendar-practice))] text-white' : 'bg-[hsl(var(--calendar-festival))] text-white'}`}>
                {event.type === 'practice' ? '練習' : '本祭・イベント'}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold mb-8 tracking-tight">{event.name}</h1>
            
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-muted rounded-xl text-muted-foreground"><Calendar className="h-6 w-6" /></div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">開催日</p>
                    <p className="text-lg font-semibold">{format(new Date(event.date), 'yyyy年MM月dd日')}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-muted rounded-xl text-muted-foreground"><Clock className="h-6 w-6" /></div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">時間</p>
                    <p className="text-lg font-semibold">{event.time || '未定'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-muted rounded-xl text-muted-foreground"><MapPin className="h-6 w-6" /></div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">場所</p>
                    <p className="text-lg font-semibold">{event.location}</p>
                  </div>
                </div>
                {event.participation_fee > 0 && (
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-500"><JapaneseYen className="h-6 w-6" /></div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">参加費</p>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-500 tabular-nums">¥{event.participation_fee.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {event.description && (
              <div className="mb-10">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">詳細内容</h3>
                <div className="prose prose-neutral dark:prose-invert max-w-none bg-muted/30 p-6 rounded-2xl">
                  <p className="whitespace-pre-wrap leading-relaxed m-0">{event.description}</p>
                </div>
              </div>
            )}

            <div className="bg-muted/40 rounded-2xl p-6 md:p-8 border border-border/50">
              <h3 className="text-xl font-bold mb-6 text-center">出欠登録</h3>
              
              <div className="max-w-md mx-auto">
                {registration ? (
                  <div className="space-y-6">
                    <div className={`p-4 rounded-xl border flex items-center justify-center gap-3 shadow-sm ${
                      registration.status === 'attended' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300' :
                      registration.status === 'absent' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300' :
                      'bg-primary/10 border-primary/20 text-primary'
                    }`}>
                      <CheckCircle2 className="h-6 w-6" />
                      <span className="text-lg font-bold">
                        {registration.status === 'attended' ? '出席として記録されています' : 
                         registration.status === 'absent' ? '欠席として記録されています' : 
                         '参加予定として登録されています'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <Button variant="outline" className={registration.status === 'registered' ? 'ring-2 ring-primary bg-primary/5' : ''} onClick={() => handleRegister('registered')} disabled={registering}>予定</Button>
                      <Button variant="outline" className={registration.status === 'attended' ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-500' : ''} onClick={() => handleRegister('attended')} disabled={registering}>出席</Button>
                      <Button variant="outline" className={registration.status === 'absent' ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-500' : ''} onClick={() => handleRegister('absent')} disabled={registering}>欠席</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => handleRegister('registered')} disabled={registering} className="h-14 text-lg rounded-xl shadow-md">
                      参加する
                    </Button>
                    <Button onClick={() => handleRegister('absent')} variant="outline" disabled={registering} className="h-14 text-lg rounded-xl text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5">
                      欠席する
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {isStaff && (
              <div className="mt-8 pt-8 border-t flex justify-end">
                <Button asChild variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                  <Link to="/operations/progress">振り落とし進捗管理へ <ChevronRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetailPage;