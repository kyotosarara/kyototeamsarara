import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

const EventListPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const records = await pb.collection('events').getList(1, 50, {
          filter: 'type="festival"',
          sort: '-date',
          $autoCancel: false
        });
        setEvents(records.items);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet><title>イベント一覧 - Dance Group Management</title></Helmet>
      <Header />
      <main className="flex-1 py-12 container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">イベント・発表会</h1>
        
        {loading ? (
          <div>読み込み中...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map(event => (
              <Card key={event.id} className="border-amber-200 dark:border-amber-900">
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                  <div className="text-sm text-muted-foreground mt-2">
                    {format(new Date(event.date), 'yyyy/MM/dd')} {event.time}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{event.location}</p>
                  {event.participation_fee > 0 && (
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-4">
                      参加費: ¥{event.participation_fee.toLocaleString()}
                    </p>
                  )}
                  <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                    <Link to={`/events/${event.id}`}>詳細を見る</Link>
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

export default EventListPage;