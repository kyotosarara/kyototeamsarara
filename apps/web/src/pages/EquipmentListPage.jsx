import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Package, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import EquipmentStatusIndicator from '@/components/EquipmentStatusIndicator';
import { format } from 'date-fns';

const EquipmentListPage = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEq = async () => {
      try {
        const records = await pb.collection('equipment').getFullList({ sort: '-created', $autoCancel: false });
        setEquipment(records);
      } catch (error) {} finally {
        setLoading(false);
      }
    };
    fetchEq();
  }, []);

  const filtered = equipment.filter(eq => eq.name.toLowerCase().includes(search.toLowerCase()) || eq.category.includes(search));

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="space-y-6">
      <Helmet><title>備品管理 - Operations</title></Helmet>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">備品管理</h1>
          <p className="text-muted-foreground mt-1">衣装・小道具の在庫と貸出状況</p>
        </div>
        <Button className="rounded-xl"><Plus className="w-4 h-4 mr-2" /> 新規備品登録</Button>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-muted/20 flex items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="備品名で検索..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-background rounded-xl" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-4 font-medium">備品名</th>
                <th className="px-6 py-4 font-medium">カテゴリ</th>
                <th className="px-6 py-4 font-medium">状態</th>
                <th className="px-6 py-4 font-medium">数量</th>
                <th className="px-6 py-4 font-medium">貸出先</th>
                <th className="px-6 py-4 font-medium text-right">アクション</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(eq => (
                <tr key={eq.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-semibold flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Package className="w-4 h-4" /></div>
                    {eq.name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground capitalize">{eq.category}</td>
                  <td className="px-6 py-4"><EquipmentStatusIndicator status={eq.condition} /></td>
                  <td className="px-6 py-4 font-medium tabular-nums">{eq.quantity || '-'}</td>
                  <td className="px-6 py-4">
                    {eq.assigned_to ? (
                      <div>
                        <span className="font-medium text-primary">{eq.assigned_to}</span>
                        {eq.checkout_date && <p className="text-xs text-muted-foreground mt-1">{format(new Date(eq.checkout_date), 'MM/dd')}〜</p>}
                      </div>
                    ) : <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="font-medium">詳細</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="text-center py-12 text-muted-foreground">備品が見つかりません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EquipmentListPage;