import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';

const VideoListPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const records = await pb.collection('videos').getList(1, 50, {
          sort: '-created_at',
          $autoCancel: false
        });
        setVideos(records.items);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet><title>動画一覧 - Dance Group Management</title></Helmet>
      <Header />
      <main className="flex-1 py-12 container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">動画一覧</h1>
        
        {loading ? (
          <div>読み込み中...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map(video => (
              <Card key={video.id}>
                <div className="aspect-video bg-muted flex items-center justify-center rounded-t-xl">
                  <Video className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                  {video.video_url && (
                    <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm mt-4 inline-block hover:underline">
                      動画を見る
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
            {videos.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">動画がありません</div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VideoListPage;