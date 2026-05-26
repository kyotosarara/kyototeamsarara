import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Save } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SettingsPage = () => {
  const { changePassword } = useAuth();
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
      toast.error('新しいパスワードが一致しません');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('パスワードは8文字以上で入力してください');
      return;
    }

    setLoading(true);

    try {
      await changePassword(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.newPasswordConfirm
      );
      toast.success('パスワードを変更しました');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
      });
    } catch (error) {
      if (error.message.includes('oldPassword')) {
        toast.error('現在のパスワードが正しくありません');
      } else {
        toast.error('パスワードの変更に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>設定 - Dance Group Management</title>
        <meta name="description" content="アカウント設定を管理します。" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>設定</h1>
              <p className="text-muted-foreground mt-2">アカウント設定を管理します</p>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>パスワード変更</CardTitle>
                  <CardDescription>セキュリティのため、定期的にパスワードを変更することをお勧めします</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">現在のパスワード</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="oldPassword"
                          name="oldPassword"
                          type="password"
                          placeholder="••••••••"
                          value={passwordData.oldPassword}
                          onChange={handlePasswordChange}
                          required
                          className="pl-10 text-foreground"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">新しいパスワード</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          placeholder="••••••••"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength={8}
                          className="pl-10 text-foreground"
                          disabled={loading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">8文字以上で入力してください</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPasswordConfirm">新しいパスワード（確認）</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPasswordConfirm"
                          name="newPasswordConfirm"
                          type="password"
                          placeholder="••••••••"
                          value={passwordData.newPasswordConfirm}
                          onChange={handlePasswordChange}
                          required
                          minLength={8}
                          className="pl-10 text-foreground"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                      <Save className="mr-2 h-4 w-4" />
                      {loading ? '変更中...' : 'パスワードを変更'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>アカウント管理</CardTitle>
                  <CardDescription>アカウントに関する重要な操作</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="text-sm text-muted-foreground">
                      アカウントの削除やその他の重要な変更については、管理者にお問い合わせください。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SettingsPage;