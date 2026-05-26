import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const NotificationSendPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('schedule');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await pb.collection('notifications').create({
        title,
        content,
        type,
        created_by: currentUser.id,
        read_by: []
      }, { $autoCancel: false });
      
      toast.success('お知らせを配信しました');
      navigate('/notifications');
    } catch (error) {
      toast.error('配信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet><title>お知らせ配信 - Dance Group Management</title></Helmet>
      <Header />
      <main className="flex-1 py-12 container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">お知らせ配信</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">種類</Label>
            <select 
              id="type"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="schedule">スケジュール変更</option>
              <option value="event">イベント告知</option>
              <option value="article">ブログ更新</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">内容</Label>
            <textarea 
              id="content"
              className="w-full min-h-[200px] p-3 rounded-md border bg-background"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '配信中...' : '配信する'}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationSendPage;