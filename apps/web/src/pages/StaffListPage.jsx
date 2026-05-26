import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Users, Filter } from 'lucide-react';
import RoleBadge from '@/components/RoleBadge';
import { Card, CardContent } from '@/components/ui/card';

const StaffListPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const records = await pb.collection('users').getFullList({
          filter: 'role="三役" || role="スタッフ"',
          sort: 'role',
          $autoCancel: false
        });
        setStaff(records);
      } catch (error) {} finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="space-y-6">
      <Helmet><title>スタッフ管理 - Operations</title></Helmet>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">スタッフ管理</h1>
          <p className="text-muted-foreground mt-1">運営メンバーの一覧と役割</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(s => (
          <Card key={s.id} className="rounded-2xl border shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="h-16 bg-muted/50 border-b relative"></div>
            <CardContent className="pt-0 relative px-6 pb-6">
               <div className="flex justify-between items-end -mt-8 mb-4">
                  <div className="h-16 w-16 rounded-xl border-4 border-card bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shadow-sm">
                    {s.profile_picture ? <img src={pb.files.getUrl(s, s.profile_picture)} className="w-full h-full object-cover rounded-lg" alt="" /> : s.name.charAt(0)}
                  </div>
                  <RoleBadge role={s.role} />
               </div>
               <h3 className="text-xl font-bold mb-1">{s.name}</h3>
               <p className="text-sm text-muted-foreground mb-4">{s.email}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StaffListPage;