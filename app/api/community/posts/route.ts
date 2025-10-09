import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/mongodb';
import ForumPost from '@/lib/db/models/ForumPost';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'recent';

    await connectDB();

    const query: any = { moderationStatus: 'approved' };
    if (category !== 'all') {
      query.category = category;
    }

    const sortOptions: any = sort === 'popular' 
      ? { likes: -1, views: -1 }
      : { createdAt: -1 };

    const posts = await ForumPost.find(query)
      .sort(sortOptions)
      .limit(50)
      .populate('authorId', 'profile.name')
      .lean();

    const formattedPosts = posts.map(post => ({
      ...post,
      author: {
        name: post.isAnonymous ? 'Anonymous' : (post.authorId as any).profile.name
      }
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Forum fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, category, isAnonymous, tags } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const post = await ForumPost.create({
      authorId: session.user.id,
      title,
      content,
      category,
      isAnonymous: isAnonymous || false,
      tags: tags || [],
    });

    return NextResponse.json({ success: true, postId: post._id });
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}