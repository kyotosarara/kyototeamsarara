import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';

const PasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSent(true);
      toast.success('パスワードリセットメールを送信しました');
    } catch (error) {
      toast.error('メール送信に失敗しました。メールアドレスを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>パスワードリセット - Dance Group Management</title>
        <meta name="description" content="パスワードをリセットして、アカウントへのアクセスを回復します。" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-2xl">D</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              パスワードリセット
            </CardTitle>
            <CardDescription className="text-center">
              {sent 
                ? 'メールを確認してください' 
                : 'メールアドレスを入力してください'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    パスワードリセット用のリンクを <strong className="text-foreground">{email}</strong> に送信しました。
                    メールを確認して、リンクをクリックしてパスワードをリセットしてください。
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    ログインページに戻る
                  </Link>
                </Button>
              </div>
            ) : (
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
                  <p className="text-xs text-muted-foreground">
                    登録済みのメールアドレスにパスワードリセット用のリンクを送信します
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? '送信中...' : 'リセットメールを送信'}
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    ログインページに戻る
                  </Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PasswordResetPage;