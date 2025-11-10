import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FloatingBubbles } from '../components/FloatingBubbles';

// Define the Post type locally. Notice 'username' is now top-level
export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  reactions: { [key: string]: number };
  created_at: string;
  username: string; // The backend query now joins this directly
}

const API_URL = 'http://localhost:4000/api';

export function Community() {
  const { profile, token } = useAuth(); // Get profile and token
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only load posts if we have a token
    if (token) {
      loadPosts();
    }
  }, [token]); // Load when token becomes available

  const loadPosts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to load posts');
      }
      const data: CommunityPost[] = await res.json();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const createPost = async () => {
    if (!profile || !token || !newPost.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newPost }),
      });

      if (!res.ok) {
        throw new Error('Failed to create post');
      }

      const createdPost: CommunityPost = await res.json();

      // Add new post to the top of the list
      setPosts([createdPost, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      // Filter out the deleted post from the UI
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const toggleReaction = async (post: CommunityPost, emoji: string) => {
    if (!profile || !token) return;

    try {
      const res = await fetch(`${API_URL}/posts/${post.id}/react`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji }),
      });

      if (!res.ok) {
        throw new Error('Failed to react');
      }

      const updatedReactions = await res.json();

      // Update the reactions for that one post in the UI
      setPosts(
        posts.map((p) =>
          p.id === post.id ? { ...p, reactions: updatedReactions } : p
        )
      );
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
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
                      {/* Use the new 'username' field */}
                      {post.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {post.username || 'Anonymous'}
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