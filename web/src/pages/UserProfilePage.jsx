import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, User, Mail, Save, TrendingUp, Calendar as CalIcon } from 'lucide-react';
import RoleBadge from '@/components/RoleBadge';
import Header from '@/components/Header';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient';
import { useParticipationRate } from '@/hooks/useParticipationRate';

const UserProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const { rate, history, stats, loading: statsLoading } = useParticipationRate(currentUser?.id);
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const avatarUrl = currentUser?.profile_picture ? pb.files.getUrl(currentUser, currentUser.profile_picture, { thumb: '200x200' }) : null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20971520) return toast.error('ファイルサイズは20MB以下にしてください');
      setProfilePicture(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = { name: formData.name, email: formData.email };
      if (profilePicture) updateData.profile_picture = profilePicture;
      await updateProfile(currentUser.id, updateData);
      toast.success('プロフィールを更新しました');
      setProfilePicture(null);
    } catch (error) {
      toast.error('プロフィールの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>プロフィール - Dance Group Management</title></Helmet>
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Header />
        <main className="flex-1 py-10 container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">プロフィール</h1>
            <p className="text-muted-foreground mt-1">アカウント情報と活動実績</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-md overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/80 to-primary"></div>
                <CardContent className="px-6 pb-6 relative pt-0">
                  <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-12 sm:-mt-16 mb-6">
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-4 border-card shadow-lg bg-card">
                      <AvatarImage src={avatarUrl} alt={currentUser?.name} />
                      <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary rounded-2xl">{getInitials(currentUser?.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
                        <RoleBadge role={currentUser?.role} />
                      </div>
                      <p className="text-muted-foreground">{currentUser?.email}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                    <div className="space-y-2">
                      <Label>プロフィール写真</Label>
                      <div className="flex items-center gap-4">
                        <Label htmlFor="profile-picture" className="cursor-pointer inline-flex items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 px-4 py-2 transition-all">
                          <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm font-medium">画像を選択</span>
                          <Input id="profile-picture" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </Label>
                        {profilePicture && <span className="text-sm text-muted-foreground truncate">{profilePicture.name}</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">名前</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} required disabled={loading} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">メールアドレス</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={loading} className="bg-background" />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full rounded-xl">
                      <Save className="mr-2 h-4 w-4" /> {loading ? '保存中...' : '変更を保存'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-md border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-primary" />参加率</CardTitle>
                </CardHeader>
                <CardContent>
                  {!statsLoading ? (
                    <div className="text-center space-y-4">
                      <div className="relative inline-flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/30" />
                          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="351.86" strokeDashoffset={351.86 - (351.86 * rate) / 100} className="text-primary transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-3xl font-extrabold tabular-nums">{rate}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm pt-4 border-t">
                        <div className="flex flex-col"><span className="text-muted-foreground">出席</span><span className="font-bold text-green-600">{stats.attended}</span></div>
                        <div className="flex flex-col"><span className="text-muted-foreground">欠席</span><span className="font-bold text-red-500">{stats.absent}</span></div>
                        <div className="flex flex-col"><span className="text-muted-foreground">予定</span><span className="font-bold text-primary">{stats.registered}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-md border-none">
                <CardHeader>
                  <CardTitle className="text-lg">最近の参加履歴</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[300px] overflow-y-auto px-6 pb-6">
                    {history.length > 0 ? (
                      <div className="space-y-4">
                        {history.slice(0, 10).map(reg => (
                          <div key={reg.id} className="flex justify-between items-center pb-3 border-b last:border-0 last:pb-0">
                            <div>
                              <p className="font-medium text-sm line-clamp-1">{reg.expand?.event_id?.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <CalIcon className="h-3 w-3" />
                                {reg.expand?.event_id?.date ? format(new Date(reg.expand.event_id.date), 'MM/dd') : '未定'}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              reg.status === 'attended' ? 'bg-green-100 text-green-700' :
                              reg.status === 'absent' ? 'bg-red-100 text-red-700' :
                              'bg-primary/10 text-primary'
                            }`}>
                              {reg.status === 'attended' ? '出席' : reg.status === 'absent' ? '欠席' : '登録済'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">履歴がありません</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default UserProfilePage;