import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const records = await pb.collection('events').getList(1, 100, {
          sort: 'date',
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
      <Helmet><title>カレンダー - Dance Group Management</title></Helmet>
      <Header />
      <main className="flex-1 py-12 container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">カレンダー</h1>
        
        {loading ? (
          <div>読み込み中...</div>
        ) : (
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <div className="grid gap-4">
              {events.map(event => (
                <div key={event.id} className={`p-4 rounded-lg border-l-4 ${event.type === 'practice' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.date), 'yyyy年MM月dd日')} {event.time}
                      </p>
                      <p className="text-sm mt-1">{event.location}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${event.type === 'practice' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'}`}>
                      {event.type === 'practice' ? '練習' : 'イベント'}
                    </span>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">予定がありません</div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CalendarPage;