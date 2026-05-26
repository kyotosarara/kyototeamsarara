import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PracticeDetailPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [practice, setPractice] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const record = await pb.collection('events').getOne(id, { $autoCancel: false });
        setPractice(record);

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
        console.error('Error fetching practice:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      if (registration) {
        await pb.collection('registrations').delete(registration.id, { $autoCancel: false });
        setRegistration(null);
        toast.success('参加をキャンセルしました');
      } else {
        const newReg = await pb.collection('registrations').create({
          user_id: currentUser.id,
          event_id: id,
          status: 'registered'
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
  if (!practice) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet><title>{`${practice.name} - Dance Group Management`}</title></Helmet>
      <Header />
      <main className="flex-1 py-12 container mx-auto px-4 max-w-3xl">
        <div className="bg-card rounded-2xl shadow-sm border p-8">
          <h1 className="text-3xl font-bold mb-6">{practice.name}</h1>
          
          <div className="space-y-4 mb-8">
            <div>
              <span className="text-muted-foreground text-sm">日時</span>
              <p className="font-medium">{format(new Date(practice.date), 'yyyy年MM月dd日')} {practice.time}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">場所</span>
              <p className="font-medium">{practice.location}</p>
            </div>
            {practice.description && (
              <div>
                <span className="text-muted-foreground text-sm">内容</span>
                <p className="mt-1">{practice.description}</p>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">参加登録</h3>
            {registration ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 text-primary rounded-lg font-medium">
                  参加登録済みです
                </div>
                <Button variant="outline" onClick={handleRegister} disabled={registering}>
                  {registering ? '処理中...' : '参加をキャンセルする'}
                </Button>
              </div>
            ) : (
              <Button onClick={handleRegister} disabled={registering} className="w-full sm:w-auto">
                {registering ? '処理中...' : '参加登録する'}
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PracticeDetailPage;