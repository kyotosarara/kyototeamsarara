import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, User } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.passwordConfirm) {
      toast.error('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('パスワードは8文字以上で入力してください');
      return;
    }

    setLoading(true);

    try {
      await signup(
        formData.email,
        formData.password,
        formData.passwordConfirm,
        formData.name
      );
      toast.success('アカウントを作成しました。確認メールを送信しました。');
      navigate('/login');
    } catch (error) {
      if (error.message.includes('email')) {
        toast.error('このメールアドレスは既に使用されています');
      } else {
        toast.error('アカウント作成に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>新規登録 - Dance Group Management</title>
        <meta name="description" content="Dance Group Management Appに新規登録して、ダンスグループの活動に参加しましょう。" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-2xl">D</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">新規登録</CardTitle>
            <CardDescription className="text-center">
              アカウントを作成してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">名前</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="山田太郎"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pl-10 text-foreground"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="pl-10 text-foreground"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">8文字以上で入力してください</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">パスワード（確認）</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    placeholder="••••••••"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="pl-10 text-foreground"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? '登録中...' : 'アカウントを作成'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">既にアカウントをお持ちの場合 </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                ログイン
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SignupPage;