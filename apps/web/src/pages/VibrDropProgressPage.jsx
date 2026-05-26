import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import OperationsLayout from '@/components/OperationsLayout';

const sections = ['Aメロ', 'Bメロ', 'サビ', '間奏', 'Cメロ', '大サビ', 'アウトロ'];

const VibrDropProgressPage = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [progressData, setProgressData] = useState({}); // { [userId-sectionName]: recordId }
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const eventId = "default-event-id"; // In a real app, select event from dropdown

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRecords = await pb.collection('users').getFullList({ sort: 'name', $autoCancel: false });
        setUsers(userRecords);

        const progRecords = await pb.collection('vibration_drop_progress').getFullList({
          filter: `event_id="${eventId}"`,
          $autoCancel: false
        });

        const mapping = {};
        progRecords.forEach(r => {
          if (r.learned) {
            mapping[`${r.user_id}-${r.section_name}`] = r.id;
          }
        });
        setProgressData(mapping);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleProgress = async (userId, sectionName) => {
    const key = `${userId}-${sectionName}`;
    const recordId = progressData[key];
    
    try {
      if (recordId) {
        // Unmark
        await pb.collection('vibration_drop_progress').delete(recordId, { $autoCancel: false });
        setProgressData(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      } else {
        // Mark learned
        const newRecord = await pb.collection('vibration_drop_progress').create({
          event_id: eventId,
          section_name: sectionName,
          user_id: userId,
          learned: true,
          learned_date: new Date().toISOString().split('T')[0]
        }, { $autoCancel: false });
        setProgressData(prev => ({ ...prev, [key]: newRecord.id }));
      }
    } catch (error) {
      toast.error('更新に失敗しました');
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="space-y-6">
      <Helmet><title>振り落とし進捗 - Operations</title></Helmet>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">振り落とし進捗管理</h1>
          <p className="text-muted-foreground mt-1">メンバーの振付習得状況を管理します</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="メンバーを検索..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-card rounded-xl" />
        </div>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-4 font-medium min-w-[150px] sticky left-0 bg-muted/95 backdrop-blur z-10 border-r shadow-[1px_0_0_0_theme(colors.border)]">メンバー名</th>
                {sections.map(sec => (
                  <th key={sec} className="px-4 py-4 font-medium text-center min-w-[100px] border-r">{sec}</th>
                ))}
                <th className="px-6 py-4 font-medium text-center min-w-[100px]">習得率</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                let learnedCount = 0;
                sections.forEach(sec => {
                  if (progressData[`${user.id}-${sec}`]) learnedCount++;
                });
                const percentage = Math.round((learnedCount / sections.length) * 100);

                return (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium sticky left-0 bg-card z-10 border-r shadow-[1px_0_0_0_theme(colors.border)]">
                      {user.name}
                    </td>
                    {sections.map(sec => {
                      const isLearned = !!progressData[`${user.id}-${sec}`];
                      return (
                        <td key={sec} className="px-4 py-2 border-r text-center">
                          <button
                            onClick={() => toggleProgress(user.id, sec)}
                            className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all ${
                              isLearned ? 'bg-[hsl(var(--eq-good))] text-white shadow-sm' : 'bg-muted text-muted-foreground/30 hover:bg-muted-foreground/10'
                            }`}
                          >
                            {isLearned ? <Check className="w-5 h-5" /> : <X className="w-4 h-4" />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold tabular-nums w-12 text-right">{percentage}%</span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
             <div className="p-12 text-center text-muted-foreground">見つかりませんでした</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VibrDropProgressPage;