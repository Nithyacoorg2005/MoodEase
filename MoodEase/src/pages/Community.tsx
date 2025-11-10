import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, CommunityPost } from '../lib/supabase';
import { FloatingBubbles } from '../components/FloatingBubbles';

type PostWithProfile = CommunityPost & {
  profiles: { username: string; avatar_url: string } | null;
};

export function Community() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setPosts(data as PostWithProfile[]);
    }
  };

  const createPost = async () => {
    if (!profile || !newPost.trim()) return;

    setLoading(true);
    await supabase.from('community_posts').insert({
      user_id: profile.id,
      content: newPost,
      reactions: {},
    });

    setNewPost('');
    setLoading(false);
    loadPosts();
  };

  const deletePost = async (postId: string) => {
    await supabase.from('community_posts').delete().eq('id', postId);
    loadPosts();
  };

  const toggleReaction = async (post: PostWithProfile, emoji: string) => {
    if (!profile) return;

    const reactions = post.reactions || {};
    const currentCount = reactions[emoji] || 0;
    const newReactions = { ...reactions, [emoji]: currentCount + 1 };

    await supabase
      .from('community_posts')
      .update({ reactions: newReactions })
      .eq('id', post.id);

    loadPosts();
  };

  const reactionEmojis = ['❤️', '🙏', '💪', '🌟', '🤗'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-20 pb-8 px-4">
      <FloatingBubbles />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-2">
            Community
          </h1>
          <p className="text-gray-600 text-lg font-light">
            Share positivity and support each other
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg mb-6"
        >
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share something positive..."
            className="w-full p-4 rounded-2xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white/50 resize-none mb-3"
            rows={3}
          />
          <button
            onClick={createPost}
            disabled={loading || !newPost.trim()}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Send size={18} />
            <span>{loading ? 'Posting...' : 'Share'}</span>
          </button>
        </motion.div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-lg text-center"
            >
              <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">No posts yet. Be the first to share!</p>
            </motion.div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                      {post.profiles?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {post.profiles?.username || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  {profile?.id === post.user_id && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                <div className="flex items-center space-x-2">
                  {reactionEmojis.map((emoji) => {
                    const count = post.reactions?.[emoji] || 0;
                    return (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(post, emoji)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
                      >
                        <span>{emoji}</span>
                        {count > 0 && (
                          <span className="text-xs font-medium text-gray-600">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
