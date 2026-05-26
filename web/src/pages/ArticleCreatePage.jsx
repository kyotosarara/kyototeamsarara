import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';

const ArticleCreatePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || content === '<p><br></p>') {
      toast.error('内容を入力してください');
      return;
    }
    setLoading(true);

    try {
      await pb.collection('articles').create({
        title,
        content,
        author_id: currentUser.id,
        published: true
      }, { $autoCancel: false });
      
      toast.success('記事を公開しました');
      navigate('/articles');
    } catch (error) {
      toast.error('作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>新規記事作成 - Dance Group Management</title></Helmet>
      <Header />
      <main className="flex-1 py-8 container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full"><Link to="/articles"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <h1 className="text-3xl font-bold tracking-tight">新規記事作成</h1>
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-xl px-6 shadow-sm">
            <Save className="h-4 w-4 mr-2" /> {loading ? '公開中...' : '公開する'}
          </Button>
        </div>
        
        <div className="bg-card p-6 md:p-8 rounded-2xl border shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">タイトル</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="記事のタイトル" className="text-lg py-6 bg-background rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-base">本文</Label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArticleCreatePage;