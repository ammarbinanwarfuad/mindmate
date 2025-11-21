import { useState, useEffect } from 'react';
import { Plus, MessageCircle, Heart, ThumbsUp, Users, Trash2, Eye, X, Send, Flag, Repeat } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: [],
    anonymous: false
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    postId: null,
    reason: '',
    description: ''
  });
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [repostData, setRepostData] = useState({
    originalPostId: null,
    repostType: 'direct', // 'direct' or 'with-thoughts'
    thoughts: '',
    anonymous: false
  });
  const [showRepostDropdown, setShowRepostDropdown] = useState(null); // Track which post's dropdown is open

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const url = selectedTag 
        ? `/community/posts?limit=20&tag=${selectedTag}`
        : '/community/posts?limit=20';
      const response = await api.get(url);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedTag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate title
    if (!newPost.title || newPost.title.trim().length < 5) {
      alert('Title must be at least 5 characters');
      return;
    }
    if (newPost.title.trim().length > 200) {
      alert('Title must be less than 200 characters');
      return;
    }
    
    // Validate content
    if (!newPost.content || newPost.content.trim().length < 10) {
      alert('Content must be at least 10 characters');
      return;
    }
    if (newPost.content.trim().length > 5000) {
      alert('Content must be less than 5000 characters');
      return;
    }
    
    try {
      await api.post('/community/posts', newPost);
      setShowModal(false);
      setNewPost({ title: '', content: '', tags: [], anonymous: false });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error.response?.data?.message || 'Failed to create post');
    }
  };

  const handleReact = async (postId, reactionType) => {
    try {
      await api.post(`/community/posts/${postId}/react`, { reactionType });
      fetchPosts();
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  // Helper function to check if user has reacted
  const hasUserReacted = (post, reactionType) => {
    if (!post.reactedBy || !user) return false;
    const userId = user._id || user.id;
    return post.reactedBy.some(r => 
      (r.userId === userId || r.userId?.toString() === userId?.toString()) && 
      r.reactionType === reactionType
    );
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/community/posts/${postId}`);
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;
    
    try {
      await api.post(`/community/posts/${postId}/comments`, {
        content: newComment,
        anonymous: commentAnonymous
      });
      setNewComment('');
      setCommentAnonymous(false);
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDirectRepost = async (postId) => {
    try {
      await api.post('/community/posts/repost', {
        originalPostId: postId,
        repostType: 'direct'
      });
      alert('Post reposted successfully!');
      fetchPosts();
    } catch (error) {
      console.error('Error reposting:', error);
      alert('Failed to repost. Please try again.');
    }
  };

  const handleRepostWithThoughts = async () => {
    if (!repostData.thoughts.trim()) {
      alert('Please add your thoughts');
      return;
    }

    try {
      await api.post('/community/posts/repost', {
        originalPostId: repostData.originalPostId,
        repostType: 'with-thoughts',
        thoughts: repostData.thoughts,
        anonymous: repostData.anonymous
      });
      alert('Post reposted with your thoughts!');
      setShowRepostModal(false);
      setRepostData({ originalPostId: null, repostType: 'direct', thoughts: '', anonymous: false });
      fetchPosts();
    } catch (error) {
      console.error('Error reposting:', error);
      alert('Failed to repost. Please try again.');
    }
  };

  const handleReportPost = async () => {
    if (!reportData.reason || !reportData.description) {
      alert('Please select a reason and provide description');
      return;
    }

    try {
      await api.post('/reports', {
        reportType: 'post',
        targetId: reportData.postId,
        reason: reportData.reason,
        description: reportData.description
      });
      alert('Report submitted successfully. Our team will review it.');
      setShowReportModal(false);
      setReportData({ postId: null, reason: '', description: '' });
    } catch (error) {
      console.error('Error reporting post:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !newPost.tags.includes(tagInput.trim())) {
      setNewPost({
        ...newPost,
        tags: [...newPost.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewPost({
      ...newPost,
      tags: newPost.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getAllTags = () => {
    const tags = new Set();
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Forum</h1>
            <p className="text-xl text-gray-600">Share and connect with peers</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-5 h-5" />
            New Post
          </Button>
        </div>

        {/* Tag Filter */}
        {getAllTags().length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === ''
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Posts
              </button>
              {getAllTags().map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share with the community</p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-5 h-5" />
                Create First Post
              </Button>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post._id} hover>
                {/* Repost Header - LinkedIn Style */}
                {post.isRepost && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 pb-3 border-b border-gray-100">
                    <Repeat className="w-4 h-4" />
                    <span>
                      <span className="font-semibold">{post.author?.name || 'Anonymous'}</span> reposted
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    {/* Show original author for reposts */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {post.isRepost && post.repostThoughts ? (post.author?.name || 'Anonymous') : (post.author?.name || 'Anonymous')}
                      </span>
                      <span className="text-sm text-gray-500">
                        • {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>

                    {/* Repost with Thoughts - Show thoughts first */}
                    {post.isRepost && post.repostThoughts && (
                      <div className="mb-4">
                        <p className="text-gray-700 italic">{post.repostThoughts}</p>
                      </div>
                    )}

                    {/* Original Post Content in Card */}
                    {post.isRepost ? (
                      <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary-600" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Original Post</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {post.title.replace('Repost: ', '')}
                        </h3>
                        <p className="text-gray-700">
                          {post.repostThoughts 
                            ? post.content.split('--- Original Post ---')[1]?.trim() 
                            : post.content}
                        </p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-700 mb-4">{post.content}</p>
                      </>
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <button
                          onClick={() => handleReact(post._id, 'supportive')}
                          className={`flex items-center gap-1 transition-colors ${
                            hasUserReacted(post, 'supportive')
                              ? 'text-green-600 font-semibold'
                              : 'text-gray-600 hover:text-green-600'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${
                            hasUserReacted(post, 'supportive')
                              ? 'fill-green-600'
                              : ''
                          }`} />
                          <span>{post.reactions?.supportive || 0}</span>
                        </button>
                        <button
                          onClick={() => handleReact(post._id, 'relatable')}
                          className={`flex items-center gap-1 transition-colors ${
                            hasUserReacted(post, 'relatable')
                              ? 'text-purple-600 font-semibold'
                              : 'text-gray-600 hover:text-purple-600'
                          }`}
                        >
                          <Users className={`w-4 h-4 ${
                            hasUserReacted(post, 'relatable')
                              ? 'fill-purple-600'
                              : ''
                          }`} />
                          <span>{post.reactions?.relatable || 0}</span>
                        </button>
                        <button
                          onClick={() => handleReact(post._id, 'helpful')}
                          className={`flex items-center gap-1 transition-colors ${
                            hasUserReacted(post, 'helpful')
                              ? 'text-blue-600 font-semibold'
                              : 'text-gray-600 hover:text-blue-600'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${
                            hasUserReacted(post, 'helpful')
                              ? 'fill-blue-600'
                              : ''
                          }`} />
                          <span>{post.reactions?.helpful || 0}</span>
                        </button>
                        <button
                          onClick={() => toggleComments(post._id)}
                          className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments?.length || 0}</span>
                        </button>
                        
                        {/* Repost Button with Click Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setShowRepostDropdown(showRepostDropdown === post._id ? null : post._id)}
                            className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
                          >
                            <Repeat className="w-4 h-4" />
                            <span>{post.repostCount || 0}</span>
                          </button>
                          
                          {/* Dropdown Menu - Shows on Click */}
                          {showRepostDropdown === post._id && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] z-10">
                              <button
                                onClick={() => {
                                  handleDirectRepost(post._id);
                                  setShowRepostDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Repeat className="w-4 h-4" />
                                Repost
                              </button>
                              <button
                                onClick={() => {
                                  setRepostData({ originalPostId: post._id, repostType: 'with-thoughts', thoughts: '', anonymous: false });
                                  setShowRepostModal(true);
                                  setShowRepostDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Send className="w-4 h-4" />
                                Repost with thoughts
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-gray-500">
                          <Eye className="w-4 h-4" />
                          <span>{post.viewCount || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Report Button - Available to all users */}
                        {post.authorId !== user?._id && (
                          <button
                            onClick={() => {
                              setReportData({ postId: post._id, reason: '', description: '' });
                              setShowReportModal(true);
                            }}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Report post"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Delete Button - Only for post author */}
                        {post.authorId === user?._id && (
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Comments Section */}
                    {showComments[post._id] && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Comments</h4>
                        
                        {/* Existing Comments */}
                        {post.comments && post.comments.length > 0 ? (
                          <div className="space-y-3 mb-4">
                            {post.comments.map((comment, idx) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {comment.anonymous ? 'Anonymous' : comment.authorId?.profile?.name || 'User'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(comment.createdAt), 'MMM dd, yyyy')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mb-4">No comments yet. Be the first to comment!</p>
                        )}

                        {/* Add Comment */}
                        <div className="space-y-2">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          />
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={commentAnonymous}
                                onChange={(e) => setCommentAnonymous(e.target.checked)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                              />
                              Comment anonymously
                            </label>
                            <Button
                              onClick={() => handleAddComment(post._id)}
                              disabled={!newComment.trim()}
                              size="sm"
                            >
                              <Send className="w-4 h-4" />
                              Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create New Post"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <span className={`text-xs ${
                  newPost.title.length < 5 ? 'text-red-500' : 
                  newPost.title.length > 200 ? 'text-red-500' : 
                  'text-gray-500'
                }`}>
                  {newPost.title.length}/200 {newPost.title.length < 5 && '(min 5)'}
                </span>
              </div>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="What's on your mind?"
                maxLength={200}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <span className={`text-xs ${
                  newPost.content.length < 10 ? 'text-red-500' : 
                  newPost.content.length > 5000 ? 'text-red-500' : 
                  'text-gray-500'
                }`}>
                  {newPost.content.length}/5000 {newPost.content.length < 10 && '(min 10)'}
                </span>
              </div>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Share your thoughts..."
                maxLength={5000}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add a tag (e.g., anxiety, stress)"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {newPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newPost.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-primary-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={newPost.anonymous}
                onChange={(e) => setNewPost({ ...newPost, anonymous: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Post anonymously
              </label>
            </div>

            <div className="flex gap-3">
              <Button type="submit" fullWidth>Create Post</Button>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* Report Modal */}
        <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Report Post">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Help us keep the community safe. Please provide details about why you're reporting this post.
            </p>

            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Report *
              </label>
              <select
                value={reportData.reason}
                onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select a reason</option>
                <option value="harassment">Harassment or Bullying</option>
                <option value="spam">Spam or Misleading</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="self-harm">Self-harm or Suicide Concerns</option>
                <option value="misinformation">Misinformation</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details *
              </label>
              <textarea
                value={reportData.description}
                onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows="4"
                placeholder="Please provide specific details about the issue..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your report will be reviewed by our moderation team. All reports are confidential.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleReportPost}
                fullWidth
                className="bg-orange-600 hover:bg-orange-700"
              >
                Submit Report
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Repost with Thoughts Modal */}
        <Modal isOpen={showRepostModal} onClose={() => setShowRepostModal(false)} title="Repost with Your Thoughts">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Share this post with your network and add your own perspective.
            </p>

            {/* Your Thoughts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Thoughts *
              </label>
              <textarea
                value={repostData.thoughts}
                onChange={(e) => setRepostData({ ...repostData, thoughts: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="What are your thoughts on this post? Why are you sharing it?"
                required
              />
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="repost-anonymous"
                checked={repostData.anonymous}
                onChange={(e) => setRepostData({ ...repostData, anonymous: e.target.checked })}
                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="repost-anonymous" className="text-sm text-gray-700">
                Repost anonymously
              </label>
            </div>

            {/* Preview of Original Post */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Original Post Preview:</p>
              <div className="text-sm text-gray-700">
                <p className="font-semibold">Post will be shown here</p>
                <p className="text-xs text-gray-500 mt-1">The original post content will be displayed below your thoughts</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleRepostWithThoughts}
                fullWidth
                className="bg-green-600 hover:bg-green-700"
              >
                Repost
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRepostModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Community;
