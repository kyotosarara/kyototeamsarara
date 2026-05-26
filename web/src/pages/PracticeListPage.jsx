import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

const PracticeListPage = () => {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const records = await pb.collection('events').getList(1, 50, {
          filter: 'type="practice"',
          sort: '-date',
          $autoCancel: false
        });
        setPractices(records.items);
      } catch (error) {
        console.error('Error fetching practices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPractices();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet><title>練習一覧 - Dance Group Management</title></Helmet>
      <Header />
      <main className="flex-1 py-12 container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">練習一覧</h1>
        
        {loading ? (
          <div>読み込み中...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {practices.map(practice => (
              <Card key={practice.id}>
                <CardHeader>
                  <CardTitle>{practice.name}</CardTitle>
                  <div className="text-sm text-muted-foreground mt-2">
                    {format(new Date(practice.date), 'yyyy/MM/dd')} {practice.time}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{practice.location}</p>
                  <Button asChild className="w-full">
                    <Link to={`/practices/${practice.id}`}>詳細を見る</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PracticeListPage;