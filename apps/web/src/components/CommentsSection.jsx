import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Trash2, MessageSquare, CornerDownRight } from 'lucide-react';
import { toast } from 'sonner';

const CommentsSection = ({ articleId }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const records = await pb.collection('comments').getFullList({
        filter: `article_id="${articleId}"`,
        sort: 'created_at',
        expand: 'author_id',
        $autoCancel: false
      });
      setComments(records);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const handleSubmit = async (e, parentId = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : newComment;
    
    if (!content.trim()) return;

    try {
      await pb.collection('comments').create({
        article_id: articleId,
        author_id: currentUser.id,
        content: content.trim(),
        parent_comment_id: parentId || ''
      }, { $autoCancel: false });
      
      toast.success('コメントを投稿しました');
      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }
      fetchComments();
    } catch (error) {
      toast.error('コメントの投稿に失敗しました');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('コメントを削除しますか？')) {
      try {
        await pb.collection('comments').delete(id, { $autoCancel: false });
        toast.success('削除しました');
        fetchComments();
      } catch (error) {
        toast.error('削除に失敗しました');
      }
    }
  };

  // Group comments by parent
  const rootComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_comment_id === parentId);

  const CommentItem = ({ comment, isReply = false }) => {
    const author = comment.expand?.author_id;
    const canDelete = currentUser?.id === author?.id || currentUser?.role === '三役';

    return (
      <div className={`flex gap-4 ${isReply ? 'ml-12 mt-4' : 'mt-6'}`}>
        <Avatar className="h-10 w-10 border shadow-sm">
          <AvatarImage src={author?.profile_picture ? pb.files.getUrl(author, author.profile_picture) : null} />
          <AvatarFallback>{author?.name?.slice(0,2) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-sm">{author?.name || '不明なユーザー'}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ja })}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-2 px-2">
            {!isReply && isAuthenticated && (
              <button 
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center transition-colors"
              >
                <MessageSquare className="h-3 w-3 mr-1" /> 返信
              </button>
            )}
            {canDelete && (
              <button 
                onClick={() => handleDelete(comment.id)}
                className="text-xs font-medium text-destructive/80 hover:text-destructive flex items-center transition-colors"
              >
                <Trash2 className="h-3 w-3 mr-1" /> 削除
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-4 flex gap-3 ml-2">
              <CornerDownRight className="h-5 w-5 text-muted-foreground shrink-0 mt-2" />
              <div className="flex-1 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="返信を入力..."
                  className="w-full text-sm p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>キャンセル</Button>
                  <Button type="submit" size="sm" disabled={!replyContent.trim()}>返信</Button>
                </div>
              </div>
            </form>
          )}

          {/* Replies */}
          {getReplies(comment.id).map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 pt-8 border-t">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" /> コメント ({comments.length})
      </h3>

      {isAuthenticated ? (
        <form onSubmit={(e) => handleSubmit(e, null)} className="mb-8 bg-card border rounded-2xl p-4 shadow-sm">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="記事へのコメントを入力..."
            className="w-full p-3 rounded-xl border-none bg-muted/30 focus:ring-0 focus:outline-none resize-none min-h-[100px] mb-3"
          />
          <div className="flex justify-end border-t pt-3">
            <Button type="submit" disabled={!newComment.trim()}>
              コメントを投稿
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-muted/50 rounded-2xl text-center">
          <p className="text-muted-foreground text-sm">コメントを投稿するにはログインが必要です</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
      ) : (
        <div className="space-y-2">
          {rootComments.length > 0 ? (
            rootComments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
              まだコメントはありません。最初のコメントを投稿しましょう！
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;