import { Link } from 'react-router-dom';
import { Brain, MessageCircle, TrendingUp, Users, Shield, Heart, Sparkles, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Home = () => {
  const features = [
    {
      icon: <MessageCircle className="w-10 h-10 text-primary-600" />,
      title: 'MindMate Chat',
      description: 'Chat 24/7 with MindMate, your empathetic AI companion created by Team Eternity for mental health support'
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-primary-600" />,
      title: 'Mood Tracking',
      description: 'Track your daily mood and discover patterns with beautiful visualizations'
    },
    {
      icon: <Users className="w-10 h-10 text-primary-600" />,
      title: 'Peer Community',
      description: 'Connect with fellow students in a safe, supportive community forum'
    },
    {
      icon: <Heart className="w-10 h-10 text-primary-600" />,
      title: 'Smart Matching',
      description: 'Get matched with peers who understand what you\'re going through'
    },
    {
      icon: <Shield className="w-10 h-10 text-primary-600" />,
      title: 'Privacy First',
      description: 'Your data is encrypted and protected. Complete anonymity available'
    },
    {
      icon: <Sparkles className="w-10 h-10 text-primary-600" />,
      title: 'AI Insights',
      description: 'Gain insights into your mental health trends and progress over time'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Brain className="w-5 h-5" />
              <span className="text-sm font-medium">AI-Powered Mental Wellness</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your Mental Wellness,{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Supported by AI
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
              MindMate is your 24/7 AI companion designed specifically for university students.
              Track your mood, chat with AI, connect with peers, and access mental health resources.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button size="large" className="group">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="large">
                  Sign In
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Free forever • No credit card required • Join 10,000+ students
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and support to help you thrive during your university journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">10,000+</div>
              <div className="text-xl opacity-90">Active Students</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50,000+</div>
              <div className="text-xl opacity-90">Mood Entries</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-xl opacity-90">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of students taking control of their mental health
          </p>
          <Link to="/register">
            <Button size="large" className="group">
              Create Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="mt-6 text-sm text-gray-500">
            ⚠️ MindMate is NOT a replacement for professional mental health care
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
