import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import ForumPost from '@/lib/db/models/ForumPost';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const post = await ForumPost.findById(params.id)
      .populate('authorId', 'profile.name')
      .populate('comments.authorId', 'profile.name')
      .lean();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment views
    await ForumPost.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    const postAny = post as any;
    const formattedPost = {
      ...postAny,
      author: postAny.isAnonymous
        ? null
        : { _id: postAny.authorId._id, name: postAny.authorId.profile.name },
      comments: postAny.comments.map((comment: any) => ({
        ...comment,
        author: comment.isAnonymous
          ? null
          : { _id: comment.authorId._id, name: comment.authorId.profile.name },
      })),
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, content, isAnonymous } = await request.json();

    await connectDB();

    if (action === 'upvote') {
      await ForumPost.findByIdAndUpdate(params.id, { $inc: { upvotes: 1 } });
      return NextResponse.json({ success: true });
    }

    if (action === 'comment') {
      if (!content) {
        return NextResponse.json(
          { error: 'Comment content required' },
          { status: 400 }
        );
      }

      await ForumPost.findByIdAndUpdate(params.id, {
        $push: {
          comments: {
            authorId: session.user.id,
            content,
            isAnonymous: isAnonymous || false,
            createdAt: new Date(),
          },
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Post update error:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const post = await ForumPost.findById(params.id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await ForumPost.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Post delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

