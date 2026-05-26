import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, Chrome, Apple } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('ログインしました');
      navigate('/');
    } catch (error) {
      toast.error('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      loginWithGoogle();
    } catch (error) {
      toast.error('Googleログインに失敗しました');
    }
  };

  const handleAppleLogin = () => {
    try {
      loginWithApple();
    } catch (error) {
      toast.error('Appleログインに失敗しました');
    }
  };

  return (
    <>
      <Helmet>
        <title>ログイン - Dance Group Management</title>
        <meta name="description" content="Dance Group Management Appにログインして、ダンスグループの活動を管理しましょう。" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-2xl">D</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">ログイン</CardTitle>
            <CardDescription className="text-center">
              アカウントにログインしてください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 text-foreground"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 text-foreground"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  to="/password-reset"
                  className="text-sm text-primary hover:underline"
                >
                  パスワードを忘れた場合
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">または</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full"
                type="button"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleAppleLogin}
                className="w-full"
                type="button"
              >
                <Apple className="mr-2 h-4 w-4" />
                Apple
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">アカウントをお持ちでない場合 </span>
              <Link to="/signup" className="text-primary hover:underline font-medium">
                新規登録
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;