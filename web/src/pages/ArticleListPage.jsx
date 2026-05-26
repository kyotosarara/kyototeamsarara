import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const ArticleListPage = () => {
  const { currentUser } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const records = await pb.collection('articles').getList(1, 50, {
          sort: '-created_at',
          expand: 'author_id',
          $autoCancel: false
        });
        setArticles(records.items);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const canCreate = ['三役', 'スタッフ'].includes(currentUser?.role);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet><title>ブログ - Dance Group Management</title></Helmet>
      <Header />
      <main className="flex-1 py-12 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">ブログ</h1>
          {canCreate && (
            <Button asChild>
              <Link to="/articles/create"><Plus className="mr-2 h-4 w-4" />新規作成</Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div>読み込み中...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map(article => (
              <Card key={article.id} className="hover:shadow-lg transition-all">
                {article.featured_image && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-xl">
                    <img 
                      src={pb.files.getUrl(article, article.featured_image)} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {format(new Date(article.created_at), 'yyyy/MM/dd')}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/articles/${article.id}`}>続きを読む</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
            {articles.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                記事がありません
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ArticleListPage;