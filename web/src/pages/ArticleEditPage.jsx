import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';

const ArticleEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const record = await pb.collection('articles').getOne(id, { $autoCancel: false });
        setTitle(record.title);
        setContent(record.content);
      } catch (error) {
        toast.error('記事の取得に失敗しました');
        navigate('/articles');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await pb.collection('articles').update(id, { title, content }, { $autoCancel: false });
      toast.success('記事を更新しました');
      navigate(`/articles/${id}`);
    } catch (error) {
      toast.error('更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet><title>記事編集 - Dance Group Management</title></Helmet>
      <Header />
      <main className="flex-1 py-8 container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full"><Link to={`/articles/${id}`}><ArrowLeft className="h-5 w-5" /></Link></Button>
            <h1 className="text-3xl font-bold tracking-tight">記事を編集</h1>
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="rounded-xl px-6 shadow-sm">
            <Save className="h-4 w-4 mr-2" /> {saving ? '保存中...' : '更新を保存'}
          </Button>
        </div>
        
        <div className="bg-card p-6 md:p-8 rounded-2xl border shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">タイトル</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="text-lg py-6 bg-background rounded-xl" />
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

export default ArticleEditPage;