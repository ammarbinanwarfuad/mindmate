import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Star, Calendar, TrendingUp, 
  BookOpen, Sparkles, BarChart3, Tag
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import JournalEditor from '../components/journal/JournalEditor';
import JournalCard from '../components/journal/JournalCard';
import JournalStats from '../components/journal/JournalStats';
import JournalInsights from '../components/journal/JournalInsights';
import JournalPrompts from '../components/journal/JournalPrompts';
import api from '../utils/api';

const JournalNew = () => {
  const [view, setView] = useState('list'); // list, create, stats, insights
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    sentiment: '',
    favorites: false
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);

  useEffect(() => {
    fetchJournals();
  }, [page, filters]);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...filters
      };
      
      const response = await api.get('/journal', { params });
      setJournals(response.data.journals);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchJournals();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/journal/search', {
        params: {
          search: searchQuery,
          ...filters,
          page
        }
      });
      setJournals(response.data.journals);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error searching journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJournalCreated = () => {
    setView('list');
    setPage(1);
    fetchJournals();
  };

  const handleJournalUpdated = () => {
    fetchJournals();
  };

  const handleJournalDeleted = (id) => {
    setJournals(journals.filter(j => j._id !== id));
  };

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="outline"
            onClick={() => setView('list')}
            className="mb-6"
          >
            ← Back to Journals
          </Button>
          <JournalEditor
            onSave={handleJournalCreated}
            onCancel={() => setView('list')}
          />
        </div>
      </div>
    );
  }

  if (view === 'stats') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Journal Statistics</h1>
            <Button
              variant="outline"
              onClick={() => setView('list')}
            >
              ← Back
            </Button>
          </div>
          <JournalStats />
        </div>
      </div>
    );
  }

  if (view === 'insights') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Journal Insights</h1>
            <Button
              variant="outline"
              onClick={() => setView('list')}
            >
              ← Back
            </Button>
          </div>
          <JournalInsights />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Journal</h1>
            <p className="text-gray-600">Express yourself through writing, voice, and photos</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setView('stats')}
            >
              <BarChart3 className="w-5 h-5" />
              Statistics
            </Button>
            <Button
              variant="outline"
              onClick={() => setView('insights')}
            >
              <Sparkles className="w-5 h-5" />
              Insights
            </Button>
            <Button onClick={() => setView('create')}>
              <Plus className="w-5 h-5" />
              New Entry
            </Button>
          </div>
        </div>

        {/* Journal Prompts */}
        <JournalPrompts onSelectPrompt={(prompt) => {
          setView('create');
          // Pass prompt to editor
        }} />

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search your journals..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <Button onClick={handleSearch}>
                Search
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Categories</option>
                <option value="gratitude">Gratitude</option>
                <option value="reflection">Reflection</option>
                <option value="goals">Goals</option>
                <option value="dreams">Dreams</option>
                <option value="thoughts">Thoughts</option>
                <option value="feelings">Feelings</option>
                <option value="experiences">Experiences</option>
                <option value="challenges">Challenges</option>
                <option value="achievements">Achievements</option>
                <option value="relationships">Relationships</option>
                <option value="self-care">Self-Care</option>
                <option value="other">Other</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="text">Text</option>
                <option value="voice">Voice</option>
                <option value="photo">Photo</option>
                <option value="mixed">Mixed</option>
              </select>

              <button
                onClick={() => setFilters({ ...filters, favorites: !filters.favorites })}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  filters.favorites
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Star className={`w-5 h-5 ${filters.favorites ? 'fill-yellow-500' : ''}`} />
              </button>
            </div>
          </div>
        </Card>

        {/* Journal List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : journals.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No journal entries yet</h3>
            <p className="text-gray-600 mb-6">
              Start your journaling journey by creating your first entry
            </p>
            <Button onClick={() => setView('create')}>
              <Plus className="w-5 h-5" />
              Create First Entry
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {journals.map((journal) => (
                <JournalCard
                  key={journal._id}
                  journal={journal}
                  onUpdate={handleJournalUpdated}
                  onDelete={handleJournalDeleted}
                  onClick={() => setSelectedJournal(journal)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JournalNew;
