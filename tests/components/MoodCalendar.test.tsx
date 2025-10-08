import { render, screen } from '@testing-library/react';
import MoodCalendar from '@/components/mood/MoodCalendar';

describe('MoodCalendar', () => {
  const mockEntries = [
    {
      date: new Date().toISOString(),
      moodScore: 8,
      emoji: '😄',
    },
  ];

  it('renders calendar component', () => {
    render(<MoodCalendar entries={mockEntries} />);
    expect(screen.getByText(/mood calendar/i)).toBeInTheDocument();
  });

  it('displays mood entry', () => {
    render(<MoodCalendar entries={mockEntries} />);
    expect(screen.getByText('😄')).toBeInTheDocument();
  });
});