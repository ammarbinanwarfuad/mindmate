import { NextRequest } from 'next/server';
import { POST } from '@/app/api/mood/entry/route';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: { id: 'test-user-id' }
  })),
}));

// Mock MongoDB connection
jest.mock('@/lib/db/mongodb', () => ({
  connectDB: jest.fn(() => Promise.resolve()),
}));

describe('/api/mood/entry', () => {
  it('creates a mood entry', async () => {
    const req = new NextRequest('http://localhost:3000/api/mood/entry', {
      method: 'POST',
      body: JSON.stringify({
        moodScore: 8,
        emoji: '😄',
        triggers: ['Academic stress'],
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});