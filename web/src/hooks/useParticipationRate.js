import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

export const useParticipationRate = (userId) => {
  const [rate, setRate] = useState(0);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ attended: 0, absent: 0, registered: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchParticipation = async () => {
      try {
        const records = await pb.collection('registrations').getFullList({
          filter: `user_id="${userId}"`,
          expand: 'event_id',
          sort: '-created',
          $autoCancel: false
        });

        let attended = 0;
        let absent = 0;
        let registered = 0;
        let pastEventsCount = 0;

        const now = new Date();

        records.forEach(record => {
          if (record.status === 'attended') attended++;
          if (record.status === 'absent') absent++;
          if (record.status === 'registered') registered++;

          // Count past events to calculate valid rate
          if (record.expand?.event_id?.date) {
            const eventDate = new Date(record.expand.event_id.date);
            if (eventDate < now) {
              pastEventsCount++;
            }
          }
        });

        const calculatedRate = pastEventsCount > 0 ? Math.round((attended / pastEventsCount) * 100) : 0;

        setRate(calculatedRate);
        setHistory(records);
        setStats({ attended, absent, registered, total: records.length });
      } catch (error) {
        console.error('Error fetching participation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipation();
  }, [userId]);

  return { rate, history, stats, loading };
};