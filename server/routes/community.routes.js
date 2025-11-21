import express from 'express';
import ForumPost from '../models/ForumPost.model.js';
import Poll from '../models/Poll.model.js';
import UserFollow from '../models/UserFollow.model.js';
import { authenticate } from '../middleware/auth.js';
import { postValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// Get all posts
router.get('/posts', authenticate, async (req, res) => {
  try {
    const { tag, limit = 20, skip = 0 } = req.query;
    
    const query = {};
    if (tag) {
      query.tags = tag;
    }
    
    const posts = await ForumPost.find(query)
      .populate('authorId', 'profile.name profile.profilePicture profile.anonymous')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const postsWithAuthor = posts.map(post => {
      const postObj = post.toObject();
      if (postObj.anonymous) {
        postObj.author = { name: 'Anonymous', profilePicture: null };
      } else {
        postObj.author = {
          name: postObj.authorId?.profile?.name || 'User',
          profilePicture: postObj.authorId?.profile?.profilePicture
        };
      }
      // Keep authorId as string for delete functionality
      postObj.authorId = postObj.authorId?._id?.toString();
      
      // Convert reactedBy userId to string for frontend comparison
      if (postObj.reactedBy) {
        postObj.reactedBy = postObj.reactedBy.map(reaction => ({
          ...reaction,
          userId: reaction.userId?.toString()
        }));
      }
      
      return postObj;
    });
    
    res.json({
      success: true,
      posts: postsWithAuthor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single post
router.get('/posts/:id', authenticate, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('authorId', 'profile.name profile.profilePicture')
      .populate('comments.authorId', 'profile.name profile.profilePicture');
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Increment view count
    post.viewCount += 1;
    await post.save();
    
    const postObj = post.toObject();
    if (postObj.anonymous) {
      postObj.author = { name: 'Anonymous', profilePicture: null };
    } else {
      postObj.author = {
        name: postObj.authorId?.profile?.name || 'User',
        profilePicture: postObj.authorId?.profile?.profilePicture
      };
    }
    
    res.json({
      success: true,
      post: postObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create post
router.post('/posts', authenticate, postValidation, validate, async (req, res) => {
  try {
    const { title, content, tags, anonymous } = req.body;
    
    const post = await ForumPost.create({
      authorId: req.user._id,
      title,
      content,
      tags: tags || [],
      anonymous: anonymous || false
    });
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Repost a post
router.post('/posts/repost', authenticate, async (req, res) => {
  try {
    const { originalPostId, repostType, thoughts, anonymous } = req.body;
    
    // Validate original post exists
    const originalPost = await ForumPost.findById(originalPostId);
    if (!originalPost) {
      return res.status(404).json({ success: false, message: 'Original post not found' });
    }
    
    // Create repost based on type
    let repostData = {
      authorId: req.user._id,
      anonymous: anonymous || false
    };
    
    if (repostType === 'direct') {
      // Direct repost - copy original content
      repostData = {
        ...repostData,
        title: originalPost.title,
        content: originalPost.content,
        tags: originalPost.tags,
        isRepost: true,
        originalPostId: originalPostId
      };
    } else if (repostType === 'with-thoughts') {
      // Repost with thoughts - add user's commentary
      if (!thoughts || thoughts.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Thoughts are required for repost with thoughts' });
      }
      
      repostData = {
        ...repostData,
        title: `Repost: ${originalPost.title}`,
        content: `${thoughts}\n\n--- Original Post ---\n${originalPost.content}`,
        tags: originalPost.tags,
        isRepost: true,
        originalPostId: originalPostId,
        repostThoughts: thoughts
      };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid repost type' });
    }
    
    // Create the repost
    const repost = await ForumPost.create(repostData);
    
    // Increment repost count on original post
    originalPost.repostCount = (originalPost.repostCount || 0) + 1;
    await originalPost.save();
    
    res.status(201).json({
      success: true,
      message: 'Post reposted successfully',
      post: repost
    });
  } catch (error) {
    console.error('Repost error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add reaction to post
router.post('/posts/:id/react', authenticate, async (req, res) => {
  try {
    const { reactionType } = req.body;
    
    if (!['supportive', 'relatable', 'helpful'].includes(reactionType)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction type' });
    }
    
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Remove existing reaction from this user
    post.reactedBy = post.reactedBy.filter(
      r => r.userId.toString() !== req.user._id.toString()
    );
    
    // Add new reaction
    post.reactedBy.push({
      userId: req.user._id,
      reactionType
    });
    
    // Update reaction counts
    post.reactions = {
      supportive: post.reactedBy.filter(r => r.reactionType === 'supportive').length,
      relatable: post.reactedBy.filter(r => r.reactionType === 'relatable').length,
      helpful: post.reactedBy.filter(r => r.reactionType === 'helpful').length
    };
    
    await post.save();
    
    res.json({
      success: true,
      reactions: post.reactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add comment to post
router.post('/posts/:id/comments', authenticate, async (req, res) => {
  try {
    const { content, anonymous } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }
    
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    post.comments.push({
      authorId: req.user._id,
      content,
      anonymous: anonymous || false,
      createdAt: new Date()
    });
    
    await post.save();
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete post
router.delete('/posts/:id', authenticate, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await post.deleteOne();
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ NEW ENDPOINTS ============

/**
 * @route   POST /api/community/posts/:id/pin
 * @desc    Pin/unpin a post (admin only for now, or post author)
 * @access  Private
 */
router.post('/posts/:id/pin', authenticate, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Toggle pin status
    post.isPinned = !post.isPinned;
    post.pinnedAt = post.isPinned ? new Date() : null;
    await post.save();
    
    res.json({
      success: true,
      message: post.isPinned ? 'Post pinned successfully' : 'Post unpinned successfully',
      isPinned: post.isPinned
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/community/posts/pinned
 * @desc    Get all pinned posts
 * @access  Private
 */
router.get('/posts/pinned/all', authenticate, async (req, res) => {
  try {
    const posts = await ForumPost.find({ isPinned: true })
      .populate('authorId', 'profile.name profile.profilePicture')
      .sort({ pinnedAt: -1 });
    
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/community/posts/:id/save
 * @desc    Save/unsave a post
 * @access  Private
 */
router.post('/posts/:id/save', authenticate, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const userIdStr = req.user._id.toString();
    const isSaved = post.savedBy.some(id => id.toString() === userIdStr);
    
    if (isSaved) {
      // Unsave
      post.savedBy = post.savedBy.filter(id => id.toString() !== userIdStr);
    } else {
      // Save
      post.savedBy.push(req.user._id);
    }
    
    await post.save();
    
    res.json({
      success: true,
      message: isSaved ? 'Post unsaved' : 'Post saved',
      isSaved: !isSaved
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/community/posts/saved
 * @desc    Get user's saved posts
 * @access  Private
 */
router.get('/posts/saved/all', authenticate, async (req, res) => {
  try {
    const posts = await ForumPost.find({ savedBy: req.user._id })
      .populate('authorId', 'profile.name profile.profilePicture')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/community/users/:id/follow
 * @desc    Follow/unfollow a user
 * @access  Private
 */
router.post('/users/:id/follow', authenticate, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }
    
    const existingFollow = await UserFollow.findOne({
      followerId: req.user._id,
      followingId: targetUserId
    });
    
    if (existingFollow) {
      // Unfollow
      await existingFollow.deleteOne();
      res.json({ success: true, message: 'Unfollowed successfully', isFollowing: false });
    } else {
      // Follow
      await UserFollow.create({
        followerId: req.user._id,
        followingId: targetUserId
      });
      res.json({ success: true, message: 'Followed successfully', isFollowing: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/community/users/:id/followers
 * @desc    Get user's followers
 * @access  Private
 */
router.get('/users/:id/followers', authenticate, async (req, res) => {
  try {
    const followers = await UserFollow.find({ followingId: req.params.id })
      .populate('followerId', 'profile.name profile.profilePicture')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, followers, count: followers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/community/users/:id/following
 * @desc    Get users that this user is following
 * @access  Private
 */
router.get('/users/:id/following', authenticate, async (req, res) => {
  try {
    const following = await UserFollow.find({ followerId: req.params.id })
      .populate('followingId', 'profile.name profile.profilePicture')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, following, count: following.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/community/poll
 * @desc    Create a poll
 * @access  Private
 */
router.post('/poll', authenticate, async (req, res) => {
  try {
    const { question, options, expiresAt, allowMultipleVotes } = req.body;
    
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Question and at least 2 options are required' 
      });
    }
    
    const poll = await Poll.create({
      question,
      options: options.map(text => ({ text, votes: 0, votedBy: [] })),
      createdBy: req.user._id,
      expiresAt,
      allowMultipleVotes: allowMultipleVotes || false
    });
    
    res.status(201).json({ success: true, poll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/community/poll/:id/vote
 * @desc    Vote on a poll
 * @access  Private
 */
router.post('/poll/:id/vote', authenticate, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }
    
    if (!poll.isActive || (poll.expiresAt && new Date() > poll.expiresAt)) {
      return res.status(400).json({ success: false, message: 'Poll has expired' });
    }
    
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ success: false, message: 'Invalid option' });
    }
    
    const userIdStr = req.user._id.toString();
    const hasVoted = poll.options.some(opt => 
      opt.votedBy.some(id => id.toString() === userIdStr)
    );
    
    if (hasVoted && !poll.allowMultipleVotes) {
      return res.status(400).json({ success: false, message: 'Already voted' });
    }
    
    // Add vote
    poll.options[optionIndex].votes += 1;
    poll.options[optionIndex].votedBy.push(req.user._id);
    poll.totalVotes += 1;
    
    await poll.save();
    
    res.json({ success: true, poll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/community/trending
 * @desc    Get trending topics/tags
 * @access  Private
 */
router.get('/trending', authenticate, async (req, res) => {
  try {
    // Get posts from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const posts = await ForumPost.find({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Count tag frequencies
    const tagCounts = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    // Sort by frequency
    const trending = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
    
    res.json({ success: true, trending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
