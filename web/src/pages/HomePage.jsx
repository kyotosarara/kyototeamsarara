import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const HomePage = () => {
  const { isAuthenticated, currentUser, initialLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialLoading && isAuthenticated) {
      // Redirect authenticated users to their respective dashboards
      if (currentUser?.role === '三役' || currentUser?.role === 'スタッフ') {
        navigate('/admin-dashboard', { replace: true }); // We'll map / to AdminDashboard in App.jsx, but this is a fallback
      } else {
        navigate('/user-dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, initialLoading, navigate]);

  if (initialLoading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  if (isAuthenticated) return null; // Will redirect

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Dance Group Management</title>
        <meta name="description" content="ダンスグループのための総合管理プラットフォーム" />
      </Helmet>
      <Header />
      
      <main className="flex-1">
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=2000&auto=format&fit=crop" 
              alt="Dance performance" 
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background"></div>
          </div>
          
          <div className="container relative z-10 px-4 py-32 text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 tracking-wider">
                FOR DANCE TEAMS
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-balance">
                チームの活動を、<br className="hidden md:block" />もっとスムーズに。
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                スケジュール管理、出欠確認、動画共有、予算管理まで。ダンスグループの運営に必要なすべての機能を一つのプラットフォームで。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg" onClick={() => navigate('/signup')}>
                  無料で始める
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg bg-background/50 backdrop-blur" onClick={() => navigate('/login')}>
                  ログイン
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;