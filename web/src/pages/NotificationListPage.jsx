import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Bell, Plus } from 'lucide-react';

const NotificationListPage = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const records = await pb.collection('notifications').getList(1, 50, {
          sort: '-created_at',
          $autoCancel: false
        });
        setNotifications(records.items);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const canCreate = ['三役', 'スタッフ'].includes(currentUser?.role);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet><title>お知らせ - Dance Group Management</title></Helmet>
      <Header />
      <main className="flex-1 py-12 container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">お知らせ</h1>
          {canCreate && (
            <Button asChild>
              <Link to="/admin/notifications"><Plus className="mr-2 h-4 w-4" />新規配信</Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div>読み込み中...</div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => {
              const isUnread = !notification.read_by?.includes(currentUser?.id);
              return (
                <Card key={notification.id} className={`transition-all ${isUnread ? 'border-primary bg-primary/5' : ''}`}>
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className={`p-2 rounded-full ${isUnread ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-semibold text-lg ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notification.created_at), 'yyyy/MM/dd')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {notification.content}
                      </p>
                      <Button asChild variant="link" className="p-0 h-auto">
                        <Link to={`/notifications/${notification.id}`}>詳細を見る</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {notifications.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">お知らせはありません</div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default NotificationListPage;