import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, differenceInDays, addDays } from 'date-fns';

const EventProcessPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventRecord = await pb.collection('events').getOne(eventId, { $autoCancel: false });
        setEvent(eventRecord);

        const taskRecords = await pb.collection('event_process').getFullList({
          filter: `event_id="${eventId}"`,
          sort: 'start_date',
          $autoCancel: false
        });
        setTasks(taskRecords);
      } catch (error) {
        console.error('Error fetching event process:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  if (!event) return <div>イベントが見つかりません</div>;

  // Prepare data for Gantt-like chart using Recharts
  // We use a stacked bar chart approach: a transparent bar for the start offset, and a colored bar for duration
  const minDate = tasks.length > 0 ? new Date(Math.min(...tasks.map(t => new Date(t.start_date)))) : new Date();
  
  const chartData = tasks.map(task => {
    const start = new Date(task.start_date);
    const end = new Date(task.end_date);
    const offsetDays = differenceInDays(start, minDate);
    const durationDays = Math.max(1, differenceInDays(end, start));
    
    return {
      name: task.task_name,
      department: task.department,
      offset: offsetDays,
      duration: durationDays,
      progress: task.progress_percentage || 0,
      assignee: task.assigned_to || '未定',
      rawStart: task.start_date,
      rawEnd: task.end_date
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length >= 2) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border shadow-lg p-4 rounded-xl text-sm">
          <p className="font-bold mb-2">{data.name}</p>
          <p className="text-muted-foreground">担当: {data.department} ({data.assignee})</p>
          <p className="text-muted-foreground">期間: {format(new Date(data.rawStart), 'MM/dd')} - {format(new Date(data.rawEnd), 'MM/dd')}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden w-32">
              <div className="h-full bg-primary" style={{ width: `${data.progress}%` }}></div>
            </div>
            <span className="font-bold">{data.progress}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      '三役': 'hsl(var(--primary))',
      '演出': 'hsl(var(--secondary))',
      '祭り企画': 'hsl(var(--chart-3, 173 58% 39%))',
      '広報': 'hsl(var(--chart-4, 43 74% 66%))',
      '総務': 'hsl(var(--chart-5, 27 87% 67%))'
    };
    return colors[dept] || 'hsl(var(--primary))';
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Helmet><title>進行管理: {event.name} - Operations</title></Helmet>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <Button asChild variant="ghost" className="mb-6 rounded-full">
          <Link to="/operations/progress"><ArrowLeft className="mr-2 h-4 w-4" />進捗管理トップへ</Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{event.name} - 進行管理</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" /> 本番日: {format(new Date(event.date), 'yyyy年MM月dd日')}
          </p>
        </div>

        <Card className="border-none shadow-sm mb-8 rounded-2xl overflow-hidden">
          <CardHeader className="bg-card border-b">
            <CardTitle>ガントチャート</CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-card">
            {tasks.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} width={150} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                    <Bar dataKey="offset" stackId="a" fill="transparent" />
                    <Bar dataKey="duration" stackId="a" radius={[4, 4, 4, 4]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getDepartmentColor(entry.department)} fillOpacity={entry.progress === 100 ? 1 : 0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">タスクが登録されていません</div>
            )}
          </CardContent>
        </Card>

        <h3 className="text-xl font-bold mb-4">タスク一覧</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map(task => (
            <Card key={task.id} className="border-none shadow-sm rounded-xl overflow-hidden">
              <div className="h-2 w-full" style={{ backgroundColor: getDepartmentColor(task.department) }}></div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-muted">{task.department}</span>
                  {task.progress_percentage === 100 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </div>
                <h4 className="font-bold text-lg mb-1">{task.task_name}</h4>
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {format(new Date(task.start_date), 'MM/dd')} - {format(new Date(task.end_date), 'MM/dd')}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${task.progress_percentage || 0}%`, backgroundColor: getDepartmentColor(task.department) }}></div>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{task.progress_percentage || 0}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default EventProcessPage;