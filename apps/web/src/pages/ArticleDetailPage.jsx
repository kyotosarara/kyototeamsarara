import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import CommentsSection from '@/components/CommentsSection';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const record = await pb.collection('articles').getOne(id, {
          expand: 'author_id',
          $autoCancel: false
        });
        setArticle(record);
      } catch (error) {
        toast.error('記事の取得に失敗しました');
        navigate('/articles');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('本当にこの記事を削除しますか？')) {
      try {
        await pb.collection('articles').delete(id, { $autoCancel: false });
        toast.success('記事を削除しました');
        navigate('/articles');
      } catch (error) {
        toast.error('削除に失敗しました');
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  if (!article) return null;

  const canEdit = currentUser?.role === '三役' || currentUser?.id === article.author_id;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet><title>{`${article.title} - Dance Group Management`}</title></Helmet>
      <Header />
      <main className="flex-1 py-10 container mx-auto px-4 max-w-3xl">
        <Button asChild variant="ghost" className="mb-8 hover:bg-muted/50 rounded-full px-4">
          <Link to="/articles"><ArrowLeft className="mr-2 h-4 w-4" />ブログ一覧に戻る</Link>
        </Button>

        <article>
          {article.featured_image && (
            <div className="mb-10 rounded-2xl overflow-hidden shadow-sm border border-border/50">
              <img 
                src={pb.files.getUrl(article, article.featured_image)} 
                alt={article.title}
                className="w-full aspect-[21/9] object-cover"
              />
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight text-balance leading-tight">{article.title}</h1>
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6 mb-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border">
                 {article.expand?.author_id?.profile_picture ? (
                   <img src={pb.files.getUrl(article.expand.author_id, article.expand.author_id.profile_picture)} className="w-full h-full object-cover" alt="" />
                 ) : (
                   article.expand?.author_id?.name?.charAt(0) || 'U'
                 )}
              </div>
              <div>
                <p className="font-medium text-sm">{article.expand?.author_id?.name || '不明なユーザー'}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(article.created_at), 'yyyy年MM月dd日 HH:mm')}</p>
              </div>
            </div>
            
            {canEdit && (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-lg bg-card">
                  <Link to={`/articles/${article.id}/edit`}><Edit className="mr-2 h-4 w-4" />編集</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete} className="rounded-lg text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5">
                  <Trash2 className="mr-2 h-4 w-4" />削除
                </Button>
              </div>
            )}
          </div>

          <div 
            className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed tracking-wide ql-editor px-0"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <CommentsSection articleId={article.id} />
        </article>
      </main>
    </div>
  );
};

export default ArticleDetailPage;