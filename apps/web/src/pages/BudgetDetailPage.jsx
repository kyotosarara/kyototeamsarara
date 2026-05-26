import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';

const BudgetDetailPage = () => {
  const { id } = useParams(); // Note: Route needs to be added in App.jsx for detail
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const b = await pb.collection('budgets').getOne(id, { $autoCancel: false });
        const exp = await pb.collection('expenses').getFullList({ filter: `budget_id="${id}"`, sort: '-date', $autoCancel: false });
        const inc = await pb.collection('income').getFullList({ filter: `budget_id="${id}"`, sort: '-date', $autoCancel: false });
        
        setBudget(b);
        setExpenses(exp);
        setIncome(inc);
      } catch (error) {} finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div>読み込み中...</div>;
  if (!budget) return <div>見つかりません</div>;

  const totalExp = expenses.reduce((a, c) => a + c.amount, 0);
  const totalInc = income.reduce((a, c) => a + c.amount, 0);
  const remaining = budget.total_amount - totalExp;

  const pieData = [
    { name: '使用済', value: totalExp, color: 'hsl(var(--budget-expense))' },
    { name: '残額', value: Math.max(0, remaining), color: 'hsl(var(--muted-foreground))' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Helmet><title>予算詳細 - Operations</title></Helmet>
      <div className="flex items-center gap-4 mb-2">
        <Button asChild variant="ghost" size="icon" className="rounded-full"><Link to="/operations/budget"><ArrowLeft className="w-5 h-5" /></Link></Button>
        <h1 className="text-3xl font-bold">{budget.title}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm border rounded-2xl">
          <CardHeader>
            <CardTitle>収支サマリー</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900/50">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2 font-medium">
                  <TrendingUp className="w-4 h-4" /> 収入合計
                </div>
                <div className="text-2xl font-bold tabular-nums">¥{totalInc.toLocaleString()}</div>
             </div>
             <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/50">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2 font-medium">
                  <TrendingDown className="w-4 h-4" /> 支出合計
                </div>
                <div className="text-2xl font-bold tabular-nums">¥{totalExp.toLocaleString()}</div>
             </div>
             <div className="col-span-2 p-4 bg-muted/50 rounded-xl border flex justify-between items-center">
                <span className="font-medium text-muted-foreground">予算上限</span>
                <span className="text-xl font-bold tabular-nums">¥{budget.total_amount.toLocaleString()}</span>
             </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border rounded-2xl flex flex-col justify-center items-center p-6">
          <h3 className="font-bold mb-4 w-full text-left">予算消化率</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <span className="text-2xl font-bold tabular-nums">{Math.round((totalExp / budget.total_amount) * 100)}%</span>
            <p className="text-xs text-muted-foreground">消化済</p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        <div>
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-xl font-bold flex items-center gap-2"><TrendingDown className="w-5 h-5 text-red-500" /> 支出一覧</h3>
           </div>
           <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
             {expenses.length > 0 ? expenses.map(e => (
               <div key={e.id} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-muted/30">
                 <div>
                   <p className="font-medium">{e.description || e.category}</p>
                   <p className="text-xs text-muted-foreground">{format(new Date(e.date), 'yyyy/MM/dd')}</p>
                 </div>
                 <span className="font-bold tabular-nums">¥{e.amount.toLocaleString()}</span>
               </div>
             )) : <div className="p-6 text-center text-muted-foreground text-sm">データがありません</div>}
           </div>
        </div>
        <div>
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /> 収入一覧</h3>
           </div>
           <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
             {income.length > 0 ? income.map(i => (
               <div key={i.id} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-muted/30">
                 <div>
                   <p className="font-medium">{i.description || i.source}</p>
                   <p className="text-xs text-muted-foreground">{format(new Date(i.date), 'yyyy/MM/dd')}</p>
                 </div>
                 <span className="font-bold tabular-nums text-green-600">¥{i.amount.toLocaleString()}</span>
               </div>
             )) : <div className="p-6 text-center text-muted-foreground text-sm">データがありません</div>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetDetailPage;