'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
  likes: number;
  comments: any[];
  views: number;
  createdAt: string;
  author: {
    name: string;
  };
}

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: '📚' },
  { id: 'academic', label: 'Academic Stress', icon: '📖' },
  { id: 'anxiety', label: 'Anxiety', icon: '😰' },
  { id: 'relationships', label: 'Relationships', icon: '💝' },
  { id: 'wellness', label: 'Wellness Tips', icon: '🌟' },
  { id: 'success', label: 'Success Stories', icon: '🎉' },
];

export default function ForumFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  useEffect(() => {
    fetchPosts();
  }, [category, sortBy]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/community/posts?category=${category}&sort=${sortBy}`
      );
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-600 mt-2">Share experiences and support each other</p>
        </div>
        <Link
          href="/community/new"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          New Post
        </Link>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                category === cat.id
                  ? 'bg-purple-100 text-purple-700 font-semibold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy('recent')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            sortBy === 'recent'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Recent
        </button>
        <button
          onClick={() => setSortBy('popular')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            sortBy === 'popular'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Popular
        </button>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <Link
              key={post._id}
              href={`/community/post/${post._id}`}
              className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {post.isAnonymous ? '?' : post.author.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {post.isAnonymous ? 'Anonymous' : post.author.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(post.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {post.category}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
              <p className="text-gray-600 line-clamp-2 mb-4">{post.content}</p>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span>👍</span>
                  {post.likes}
                </span>
                <span className="flex items-center gap-1">
                  <span>💬</span>
                  {post.comments.length}
                </span>
                <span className="flex items-center gap-1">
                  <span>👁️</span>
                  {post.views}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500 text-lg">No posts yet in this category</p>
            <Link
              href="/community/new"
              className="inline-block mt-4 text-purple-600 font-semibold hover:underline"
            >
              Be the first to post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}