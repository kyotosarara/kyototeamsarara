import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Eye, Share2, ArrowLeft, Video, Image as ImageIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import CommentsSection from '@/components/CommentsSection';

const VLOGDetailPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [vlog, setVlog] = useState(null);
  const [relatedVlogs, setRelatedVlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeRecordId, setLikeRecordId] = useState(null);

  useEffect(() => {
    const fetchVlog = async () => {
      try {
        const record = await pb.collection('vlogs').getOne(id, {
          expand: 'uploader_id',
          $autoCancel: false
        });
        setVlog(record);

        // Increment view count
        await pb.collection('vlogs').update(id, { view_count: (record.view_count || 0) + 1 }, { $autoCancel: false });

        // Fetch related
        const related = await pb.collection('vlogs').getList(1, 4, {
          filter: `category="${record.category}" && id!="${id}"`,
          sort: '-created_at',
          $autoCancel: false
        });
        setRelatedVlogs(related.items);

        // Check if liked
        if (currentUser) {
          const likes = await pb.collection('vlog_likes').getList(1, 1, {
            filter: `vlog_id="${id}" && user_id="${currentUser.id}"`,
            $autoCancel: false
          });
          if (likes.items.length > 0) {
            setIsLiked(true);
            setLikeRecordId(likes.items[0].id);
          }
        }
      } catch (error) {
        toast.error('コンテンツの取得に失敗しました');
        navigate('/vlogs');
      } finally {
        setLoading(false);
      }
    };
    fetchVlog();
  }, [id, currentUser, navigate]);

  const handleLike = async () => {
    if (!currentUser) return toast.error('ログインが必要です');
    
    try {
      if (isLiked && likeRecordId) {
        await pb.collection('vlog_likes').delete(likeRecordId, { $autoCancel: false });
        await pb.collection('vlogs').update(id, { likes_count: Math.max(0, (vlog.likes_count || 1) - 1) }, { $autoCancel: false });
        setIsLiked(false);
        setLikeRecordId(null);
        setVlog(prev => ({ ...prev, likes_count: Math.max(0, (prev.likes_count || 1) - 1) }));
      } else {
        const newLike = await pb.collection('vlog_likes').create({
          vlog_id: id,
          user_id: currentUser.id
        }, { $autoCancel: false });
        await pb.collection('vlogs').update(id, { likes_count: (vlog.likes_count || 0) + 1 }, { $autoCancel: false });
        setIsLiked(true);
        setLikeRecordId(newLike.id);
        setVlog(prev => ({ ...prev, likes_count: (prev.likes_count || 0) + 1 }));
      }
    } catch (error) {
      toast.error('操作に失敗しました');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('リンクをコピーしました');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  if (!vlog) return null;

  const uploader = vlog.expand?.uploader_id;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet><title>{`${vlog.title} - Moment VLOG`}</title></Helmet>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/vlogs')} className="mb-6 rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> 一覧に戻る
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Content Area */}
            <div className="bg-card rounded-2xl overflow-hidden border shadow-sm">
              {vlog.content_type === 'video' && (
                <div className="aspect-video bg-black relative">
                  {vlog.video_url ? (
                    <iframe 
                      src={vlog.video_url.replace('watch?v=', 'embed/')} 
                      className="w-full h-full absolute inset-0" 
                      allowFullScreen 
                      title={vlog.title}
                    />
                  ) : vlog.video_file ? (
                    <video 
                      src={pb.files.getUrl(vlog, vlog.video_file)} 
                      controls 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50">動画ソースがありません</div>
                  )}
                </div>
              )}

              {vlog.content_type === 'photo' && (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
                  <span className="ml-4 text-muted-foreground">写真ギャラリー (開発中)</span>
                </div>
              )}

              {vlog.content_type === 'text' && (
                <div className="p-8 md:p-12 bg-card">
                  <div 
                    className="prose prose-neutral dark:prose-invert max-w-none ql-editor px-0"
                    dangerouslySetInnerHTML={{ __html: vlog.text_content }}
                  />
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md text-white ${
                    vlog.content_type === 'video' ? 'bg-[hsl(var(--vlog-video))]' : 
                    vlog.content_type === 'photo' ? 'bg-[hsl(var(--vlog-photo))]' : 
                    'bg-[hsl(var(--vlog-text))]'
                  }`}>
                    {vlog.content_type === 'video' ? '動画' : vlog.content_type === 'photo' ? '写真' : '記事'}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
                    {vlog.category === 'practice' ? '練習' : vlog.category === 'festival' ? '本番' : '裏側'}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold mb-4">{vlog.title}</h1>
                
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={uploader?.profile_picture ? pb.files.getUrl(uploader, uploader.profile_picture) : null} />
                      <AvatarFallback>{uploader?.name?.slice(0,2) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{uploader?.name || '不明なユーザー'}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(vlog.created_at), 'yyyy年MM月dd日')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant={isLiked ? "secondary" : "outline"} size="sm" onClick={handleLike} className={`rounded-full ${isLiked ? 'text-red-500' : ''}`}>
                      <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} /> {vlog.likes_count || 0}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full">
                      <Share2 className="w-4 h-4 mr-2" /> 共有
                    </Button>
                  </div>
                </div>

                {vlog.description && (
                  <div className="mt-6 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {vlog.description}
                  </div>
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8">
              <CommentsSection articleId={vlog.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg">関連コンテンツ</h3>
            <div className="grid gap-4">
              {relatedVlogs.map(related => (
                <Link key={related.id} to={`/vlogs/${related.id}`} className="group flex gap-3 bg-card p-2 rounded-xl border hover:bg-muted/30 transition-colors">
                  <div className="w-32 aspect-video bg-muted rounded-lg overflow-hidden shrink-0 relative">
                    {related.thumbnail_url ? (
                      <img src={related.thumbnail_url} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary">
                        <Video className="w-6 h-6 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center py-1">
                    <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{related.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(related.created_at), 'MM/dd')}</p>
                  </div>
                </Link>
              ))}
              {relatedVlogs.length === 0 && (
                <p className="text-sm text-muted-foreground">関連コンテンツはありません</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VLOGDetailPage;