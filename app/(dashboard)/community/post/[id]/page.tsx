'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: {
    _id: string;
    name: string;
  } | null;
  isAnonymous: boolean;
  upvotes: number;
  comments: Array<{
    _id: string;
    author: {
      _id: string;
      name: string;
    } | null;
    isAnonymous: boolean;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/community/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        alert('Post not found');
        router.push('/community');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      await fetch(`/api/community/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote' })
      });
      fetchPost();
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/community/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          content: commentText.trim(),
          isAnonymous
        })
      });

      if (response.ok) {
        setCommentText('');
        setIsAnonymous(false);
        fetchPost();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Post Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

        {/* Author and Date */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
            {post.isAnonymous ? '?' : (post.author?.name?.[0]?.toUpperCase() || 'U')}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {post.isAnonymous ? 'Anonymous' : post.author?.name || 'Unknown User'}
            </div>
            <div className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleUpvote}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <span className="text-xl">👍</span>
            <span className="font-medium">{post.upvotes}</span>
          </button>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-xl">💬</span>
            <span className="font-medium">{post.comments.length}</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comments ({post.comments.length})
        </h2>

        {/* Comment Form */}
        <form onSubmit={handleComment} className="mb-8">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none mb-3"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="comment-anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="comment-anonymous" className="text-sm text-gray-600">
                Comment anonymously
              </label>
            </div>
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {post.comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            post.comments.map((comment) => (
              <div key={comment._id} className="border-l-4 border-purple-200 pl-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {comment.isAnonymous ? '?' : (comment.author?.name?.[0]?.toUpperCase() || 'U')}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">
                      {comment.isAnonymous ? 'Anonymous' : comment.author?.name || 'Unknown User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

