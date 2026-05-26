import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Plus, Wallet, TrendingUp, AlertCircle } from 'lucide-react';

const BudgetListPage = () => {
  const { currentUser } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const records = await pb.collection('budgets').getList(1, 50, {
          sort: '-created',
          $autoCancel: false
        });
        
        // Fetch expenses to calculate progress
        const enriched = await Promise.all(records.items.map(async b => {
          const exp = await pb.collection('expenses').getList(1, 500, { filter: `budget_id="${b.id}"`, $autoCancel: false });
          const spent = exp.items.reduce((sum, item) => sum + item.amount, 0);
          return { ...b, spent };
        }));
        
        setBudgets(enriched);
      } catch (error) {
        console.error('Error fetching budgets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="space-y-8">
      <Helmet><title>予算管理 - Operations</title></Helmet>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">予算管理</h1>
          <p className="text-muted-foreground mt-1">イベント予算と収支の追跡</p>
        </div>
        {currentUser?.role === '三役' && (
          <Button className="rounded-xl shadow-sm"><Plus className="w-4 h-4 mr-2" /> 予算枠を作成</Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {budgets.map(budget => {
          const progress = Math.min((budget.spent / budget.total_amount) * 100, 100);
          const isOverBudget = budget.spent > budget.total_amount;
          
          return (
            <Card key={budget.id} className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary mb-3"><Wallet className="w-5 h-5" /></div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    budget.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 
                    budget.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                  }`}>
                    {budget.status === 'approved' ? '承認済' : budget.status === 'rejected' ? '却下' : '承認待ち'}
                  </span>
                </div>
                <CardTitle className="text-xl">{budget.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">使用済 / 予算額</p>
                    <p className="font-bold text-lg tabular-nums">¥{budget.spent.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ ¥{budget.total_amount.toLocaleString()}</span></p>
                  </div>
                  {isOverBudget && <AlertCircle className="w-5 h-5 text-destructive mb-1" />}
                </div>
                
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isOverBudget ? 'bg-destructive' : 'bg-[hsl(var(--budget-income))]'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-6 px-6">
                <Button asChild variant="outline" className="w-full rounded-xl">
                  <Link to={`/operations/budget/${budget.id}`}>詳細を見る</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
        {budgets.length === 0 && (
          <div className="col-span-full text-center py-16 border-2 border-dashed rounded-2xl text-muted-foreground">予算データがありません</div>
        )}
      </div>
    </div>
  );
};

export default BudgetListPage;