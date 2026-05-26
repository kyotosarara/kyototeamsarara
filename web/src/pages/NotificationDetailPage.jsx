import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const NotificationDetailPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndMarkRead = async () => {
      try {
        const record = await pb.collection('notifications').getOne(id, { $autoCancel: false });
        setNotification(record);

        // Mark as read
        if (currentUser && !record.read_by?.includes(currentUser.id)) {
          const updatedReadBy = [...(record.read_by || []), currentUser.id];
          await pb.collection('notifications').update(id, {
            read_by: updatedReadBy
          }, { $autoCancel: false });
        }
      } catch (error) {
        console.error('Error fetching notification:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndMarkRead();
  }, [id, currentUser]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  if (!notification) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet><title>{`${notification.title} - Dance Group Management`}</title></Helmet>
      <Header />
      <main className="flex-1 py-12 container mx-auto px-4 max-w-3xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/notifications"><ArrowLeft className="mr-2 h-4 w-4" />一覧に戻る</Link>
        </Button>

        <div className="bg-card rounded-2xl shadow-sm border p-8">
          <div className="mb-6 border-b pb-6">
            <h1 className="text-3xl font-bold mb-2">{notification.title}</h1>
            <div className="text-sm text-muted-foreground">
              {format(new Date(notification.created_at), 'yyyy年MM月dd日 HH:mm')}
            </div>
          </div>
          
          <div className="whitespace-pre-wrap leading-relaxed">
            {notification.content}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationDetailPage;