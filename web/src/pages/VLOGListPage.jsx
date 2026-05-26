import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, Search, Play, Heart, Eye, Plus, Image as ImageIcon, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

const VLOGListPage = () => {
  const [vlogs, setVlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [contentType, setContentType] = useState('all');

  useEffect(() => {
    const fetchVlogs = async () => {
      try {
        let filters = [];
        if (category !== 'all') filters.push(`category="${category}"`);
        if (contentType !== 'all') filters.push(`content_type="${contentType}"`);
        
        const filterStr = filters.join(' && ');
        
        const records = await pb.collection('vlogs').getList(1, 12, {
          filter: filterStr,
          sort: '-created_at',
          expand: 'uploader_id',
          $autoCancel: false
        });
        setVlogs(records.items);
      } catch (error) {
        console.error('Error fetching vlogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVlogs();
  }, [category, contentType]);

  const filteredVlogs = vlogs.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return <Video className="w-3 h-3 mr-1" />;
      case 'photo': return <ImageIcon className="w-3 h-3 mr-1" />;
      case 'text': return <FileText className="w-3 h-3 mr-1" />;
      default: return <Video className="w-3 h-3 mr-1" />;
    }
  };

  const getTypeBadgeClass = (type) => {
    switch(type) {
      case 'video': return 'vlog-badge-video';
      case 'photo': return 'vlog-badge-photo';
      case 'text': return 'vlog-badge-text';
      default: return 'vlog-badge-video';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Helmet><title>Moment VLOG - Dance Group Management</title></Helmet>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Video className="w-8 h-8 text-primary" /> Moment VLOG
            </h1>
            <p className="text-muted-foreground mt-2">練習風景やイベントの思い出を共有しましょう</p>
          </div>
          <Button asChild className="rounded-full shadow-sm">
            <Link to="/vlog/upload"><Plus className="w-4 h-4 mr-2" /> 投稿を作成</Link>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="検索..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-10 bg-card rounded-xl border-none shadow-sm" 
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2 bg-card p-1 rounded-xl shadow-sm">
              {['all', 'video', 'photo', 'text'].map(type => (
                <Button 
                  key={type} 
                  variant={contentType === type ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setContentType(type)}
                  className="rounded-lg text-xs"
                >
                  {type === 'all' ? 'すべて' : type === 'video' ? '動画' : type === 'photo' ? '写真' : '記事'}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 bg-card p-1 rounded-xl shadow-sm">
              {['all', 'practice', 'festival', 'behind-the-scenes'].map(cat => (
                <Button 
                  key={cat} 
                  variant={category === cat ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setCategory(cat)}
                  className="rounded-lg text-xs"
                >
                  {cat === 'all' ? '全カテゴリ' : cat === 'practice' ? '練習' : cat === 'festival' ? '本番' : '裏側'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-video bg-muted animate-pulse rounded-2xl"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVlogs.map(vlog => (
              <Link key={vlog.id} to={`/vlogs/${vlog.id}`} className="group">
                <Card className="border-none shadow-sm hover:shadow-md transition-all bg-card overflow-hidden rounded-2xl h-full flex flex-col">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {vlog.thumbnail_url ? (
                      <img src={vlog.thumbnail_url} alt={vlog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary">
                        {vlog.content_type === 'text' ? <FileText className="w-12 h-12 opacity-50" /> : 
                         vlog.content_type === 'photo' ? <ImageIcon className="w-12 h-12 opacity-50" /> : 
                         <Play className="w-12 h-12 opacity-50" />}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className={`flex items-center text-[10px] px-2 py-1 rounded-md backdrop-blur-md font-medium ${getTypeBadgeClass(vlog.content_type)}`}>
                        {getTypeIcon(vlog.content_type)}
                        {vlog.content_type === 'video' ? '動画' : vlog.content_type === 'photo' ? '写真' : '記事'}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">
                      {vlog.category === 'practice' ? '練習' : vlog.category === 'festival' ? '本番' : '裏側'}
                    </div>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">{vlog.title}</h3>
                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate pr-2">{vlog.expand?.uploader_id?.name || '不明'}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {vlog.view_count || 0}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {vlog.likes_count || 0}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground/70 mt-2">
                      {formatDistanceToNow(new Date(vlog.created_at), { addSuffix: true, locale: ja })}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {filteredVlogs.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground bg-card rounded-3xl border border-dashed">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>コンテンツが見つかりません</p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VLOGListPage;