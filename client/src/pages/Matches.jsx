import { useState, useEffect } from 'react';
import { Heart, Users, Sparkles } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';

const Matches = () => {
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchesRes, myMatchesRes] = await Promise.all([
        api.get('/matching/find'),
        api.get('/matching/my-matches')
      ]);
      setPotentialMatches(matchesRes.data.matches);
      setMyMatches(myMatchesRes.data.matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId, matchScore) => {
    try {
      await api.post('/matching/request', { targetUserId: userId, matchScore });
      fetchData();
    } catch (error) {
      console.error('Error sending match request:', error);
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Peer Matching</h1>
          <p className="text-xl text-gray-600">Connect with supportive peers</p>
        </div>

        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === 'discover' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('discover')}
          >
            <Sparkles className="w-5 h-5" />
            Discover
          </Button>
          <Button
            variant={activeTab === 'connections' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('connections')}
          >
            <Users className="w-5 h-5" />
            My Connections ({myMatches.length})
          </Button>
        </div>

        {activeTab === 'discover' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {potentialMatches.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3 text-center py-12">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
                <p className="text-gray-600">Check back later for new potential connections</p>
              </Card>
            ) : (
              potentialMatches.map((match) => (
                <Card key={match.userId} hover>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl text-white font-bold">
                        {match.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{match.name}</h3>
                    {match.university && (
                      <p className="text-sm text-gray-600 mb-2">{match.university}</p>
                    )}
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                      <Sparkles className="w-4 h-4" />
                      {match.matchScore}% Match
                    </div>
                    {match.bio && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{match.bio}</p>
                    )}
                    <Button
                      fullWidth
                      onClick={() => handleConnect(match.userId, match.matchScore)}
                    >
                      <Heart className="w-4 h-4" />
                      Connect
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myMatches.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3 text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No connections yet</h3>
                <p className="text-gray-600 mb-6">Start discovering and connecting with peers</p>
                <Button onClick={() => setActiveTab('discover')}>
                  Discover Matches
                </Button>
              </Card>
            ) : (
              myMatches.map((match) => (
                <Card key={match.matchId} hover>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl text-white font-bold">
                        {match.user.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{match.user.name}</h3>
                    {match.user.university && (
                      <p className="text-sm text-gray-600 mb-4">{match.user.university}</p>
                    )}
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      {match.matchScore}% Match
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
