import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Settings } from 'lucide-react';

const HPLinksPage = () => {
  const { currentUser } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const records = await pb.collection('hp_links').getList(1, 100, {
          sort: 'order',
          $autoCancel: false
        });
        setLinks(records.items);
      } catch (error) {
        console.error('Error fetching links:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  const categories = [...new Set(links.map(l => l.category))];
  const canManage = currentUser?.role === '三役';

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet><title>リンク集 - Dance Group Management</title></Helmet>
      <Header />
      <main className="flex-1 py-12 container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">リンク集</h1>
          {canManage && (
            <Button asChild variant="outline">
              <Link to="/admin/links"><Settings className="mr-2 h-4 w-4" />リンク管理</Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div>読み込み中...</div>
        ) : (
          <div className="space-y-8">
            {categories.map(category => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">{category}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {links.filter(l => l.category === category).map(link => (
                    <a 
                      key={link.id} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Card className="hover:border-primary transition-colors h-full">
                        <CardContent className="p-4 flex items-center justify-between">
                          <span className="font-medium">{link.title}</span>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            ))}
            {links.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">リンクがありません</div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HPLinksPage;