import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminEmailsPage = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'スタッフ',
    department: ''
  });

  const fetchEmails = async () => {
    try {
      const records = await pb.collection('admin_emails').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setEmails(records);
    } catch (error) {
      toast.error('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      setFormData({
        email: record.email,
        name: record.name,
        role: record.role,
        department: record.department || ''
      });
    } else {
      setEditingId(null);
      setFormData({ email: '', name: '', role: 'スタッフ', department: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await pb.collection('admin_emails').update(editingId, formData, { $autoCancel: false });
        toast.success('更新しました');
      } else {
        await pb.collection('admin_emails').create(formData, { $autoCancel: false });
        toast.success('追加しました');
      }
      setIsModalOpen(false);
      fetchEmails();
    } catch (error) {
      toast.error(error.message || '保存に失敗しました');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('本当に削除しますか？')) {
      try {
        await pb.collection('admin_emails').delete(id, { $autoCancel: false });
        toast.success('削除しました');
        fetchEmails();
      } catch (error) {
        toast.error('削除に失敗しました');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Helmet><title>管理者メール設定 - Operations</title></Helmet>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" /> 管理者メール設定
            </h1>
            <p className="text-muted-foreground mt-2">登録されたメールアドレスでログインしたユーザーに自動で権限を付与します</p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenModal()} className="rounded-xl shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> 新規追加
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingId ? '管理者を編集' : '管理者を新規追加'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>メールアドレス <span className="text-destructive">*</span></Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>名前 <span className="text-destructive">*</span></Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>権限 <span className="text-destructive">*</span></Label>
                  <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="三役">三役</SelectItem>
                      <SelectItem value="スタッフ">スタッフ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>部署 (任意)</Label>
                  <Select value={formData.department} onValueChange={v => setFormData({...formData, department: v})}>
                    <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="演出">演出</SelectItem>
                      <SelectItem value="祭り企画">祭り企画</SelectItem>
                      <SelectItem value="広報">広報</SelectItem>
                      <SelectItem value="総務">総務</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>キャンセル</Button>
                  <Button type="submit">保存する</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">名前</th>
                  <th className="px-6 py-4 font-medium">メールアドレス</th>
                  <th className="px-6 py-4 font-medium">権限</th>
                  <th className="px-6 py-4 font-medium">部署</th>
                  <th className="px-6 py-4 font-medium">登録日</th>
                  <th className="px-6 py-4 font-medium text-right">アクション</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-8">読み込み中...</td></tr>
                ) : emails.length > 0 ? (
                  emails.map(email => (
                    <tr key={email.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium">{email.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{email.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${email.role === '三役' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                          {email.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{email.department || '-'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{format(new Date(email.created), 'yyyy/MM/dd')}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenModal(email)} className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(email.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-12 text-muted-foreground">登録データがありません</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminEmailsPage;