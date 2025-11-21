import { useState, useEffect } from 'react';
import { Shield, Save, AlertTriangle, Heart, Phone, Users, Home } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';

const SafetyPlan = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState({
    warningSignals: [''],
    copingStrategies: [''],
    distractions: [''],
    socialSupport: [],
    professionalContacts: [],
    emergencyContacts: [],
    safeEnvironment: [],
    reasonsToLive: ['']
  });

  useEffect(() => {
    fetchSafetyPlan();
  }, []);

  const fetchSafetyPlan = async () => {
    try {
      const response = await api.get('/safety/plan');
      if (response.data.safetyPlan) {
        setPlan({
          warningSignals: response.data.safetyPlan.warningSignals?.length > 0 
            ? response.data.safetyPlan.warningSignals 
            : [''],
          copingStrategies: response.data.safetyPlan.copingStrategies?.length > 0 
            ? response.data.safetyPlan.copingStrategies 
            : [''],
          distractions: response.data.safetyPlan.distractions?.length > 0 
            ? response.data.safetyPlan.distractions 
            : [''],
          socialSupport: response.data.safetyPlan.socialSupport || [],
          professionalContacts: response.data.safetyPlan.professionalContacts || [],
          emergencyContacts: response.data.safetyPlan.emergencyContacts || [],
          safeEnvironment: response.data.safetyPlan.safeEnvironment || [],
          reasonsToLive: response.data.safetyPlan.reasonsToLive?.length > 0 
            ? response.data.safetyPlan.reasonsToLive 
            : ['']
        });
      }
    } catch (error) {
      console.error('Error fetching safety plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Filter out empty strings
      const cleanedPlan = {
        warningSignals: plan.warningSignals.filter(s => s.trim()),
        copingStrategies: plan.copingStrategies.filter(s => s.trim()),
        distractions: plan.distractions.filter(s => s.trim()),
        socialSupport: plan.socialSupport,
        professionalContacts: plan.professionalContacts,
        emergencyContacts: plan.emergencyContacts,
        safeEnvironment: plan.safeEnvironment,
        reasonsToLive: plan.reasonsToLive.filter(s => s.trim())
      };

      await api.post('/safety/plan', cleanedPlan);
      alert('Safety plan saved successfully! ✓');
    } catch (error) {
      console.error('Error saving safety plan:', error);
      alert('Failed to save safety plan');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field) => {
    setPlan(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateItem = (field, index, value) => {
    setPlan(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeItem = (field, index) => {
    setPlan(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addContact = (field) => {
    const newContact = field === 'socialSupport' || field === 'emergencyContacts'
      ? { name: '', relationship: '', phone: '', notes: '' }
      : { name: '', role: '', phone: '', address: '', notes: '' };
    
    setPlan(prev => ({
      ...prev,
      [field]: [...prev[field], newContact]
    }));
  };

  const updateContact = (field, index, key, value) => {
    setPlan(prev => ({
      ...prev,
      [field]: prev[field].map((contact, i) => 
        i === index ? { ...contact, [key]: value } : contact
      )
    }));
  };

  const removeContact = (field, index) => {
    setPlan(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-primary-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Safety Plan</h1>
              <p className="text-xl text-gray-600">Your personalized crisis response plan</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 What is a Safety Plan?</strong> A safety plan is a personalized, practical plan 
              that can help you avoid dangerous situations and know how to react when you're in crisis.
            </p>
          </div>
        </div>

        {/* Warning Signals */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">1. Warning Signals</h2>
          </div>
          <p className="text-gray-600 mb-4">
            What thoughts, images, moods, situations, or behaviors indicate a crisis may be developing?
          </p>
          
          {plan.warningSignals.map((signal, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={signal}
                onChange={(e) => updateItem('warningSignals', index, e.target.value)}
                placeholder="e.g., Feeling hopeless, isolating myself..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {plan.warningSignals.length > 1 && (
                <Button
                  variant="outline"
                  onClick={() => removeItem('warningSignals', index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addItem('warningSignals')}
            className="mt-2"
          >
            + Add Warning Signal
          </Button>
        </Card>

        {/* Coping Strategies */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-pink-600" />
            <h2 className="text-2xl font-bold text-gray-900">2. Internal Coping Strategies</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Things I can do to take my mind off my problems without contacting another person:
          </p>
          
          {plan.copingStrategies.map((strategy, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={strategy}
                onChange={(e) => updateItem('copingStrategies', index, e.target.value)}
                placeholder="e.g., Deep breathing, meditation, journaling..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {plan.copingStrategies.length > 1 && (
                <Button
                  variant="outline"
                  onClick={() => removeItem('copingStrategies', index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addItem('copingStrategies')}
            className="mt-2"
          >
            + Add Coping Strategy
          </Button>
        </Card>

        {/* Social Support */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">3. Social Support</h2>
          </div>
          <p className="text-gray-600 mb-4">
            People I can reach out to for support:
          </p>
          
          {plan.socialSupport.map((contact, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg mb-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => updateContact('socialSupport', index, 'name', e.target.value)}
                  placeholder="Name"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={contact.relationship}
                  onChange={(e) => updateContact('socialSupport', index, 'relationship', e.target.value)}
                  placeholder="Relationship"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => updateContact('socialSupport', index, 'phone', e.target.value)}
                  placeholder="Phone"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <Button
                  variant="outline"
                  onClick={() => removeContact('socialSupport', index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addContact('socialSupport')}
            className="mt-2"
          >
            + Add Contact
          </Button>
        </Card>

        {/* Emergency Contacts */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">4. Emergency Contacts</h2>
          </div>
          <p className="text-gray-600 mb-4">
            People to contact in an emergency:
          </p>
          
          {plan.emergencyContacts.map((contact, index) => (
            <div key={index} className="p-4 bg-red-50 rounded-lg mb-3 border-2 border-red-200">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => updateContact('emergencyContacts', index, 'name', e.target.value)}
                  placeholder="Name"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={contact.relationship}
                  onChange={(e) => updateContact('emergencyContacts', index, 'relationship', e.target.value)}
                  placeholder="Relationship"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => updateContact('emergencyContacts', index, 'phone', e.target.value)}
                  placeholder="Phone"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <Button
                  variant="outline"
                  onClick={() => removeContact('emergencyContacts', index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addContact('emergencyContacts')}
            className="mt-2"
          >
            + Add Emergency Contact
          </Button>
        </Card>

        {/* Reasons to Live */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">5. Reasons for Living</h2>
          </div>
          <p className="text-gray-600 mb-4">
            What makes life worth living? What are you living for?
          </p>
          
          {plan.reasonsToLive.map((reason, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={reason}
                onChange={(e) => updateItem('reasonsToLive', index, e.target.value)}
                placeholder="e.g., My family, my pets, my goals..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              {plan.reasonsToLive.length > 1 && (
                <Button
                  variant="outline"
                  onClick={() => removeItem('reasonsToLive', index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => addItem('reasonsToLive')}
            className="mt-2"
          >
            + Add Reason
          </Button>
        </Card>

        {/* Crisis Hotlines */}
        <Card className="p-6 mb-6 bg-red-50 border-2 border-red-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🆘 Crisis Hotlines</h2>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg">
              <p className="font-bold text-gray-900">988 Suicide & Crisis Lifeline</p>
              <p className="text-sm text-gray-600">Call or text: <a href="tel:988" className="text-blue-600 font-bold">988</a></p>
              <p className="text-xs text-gray-500">24/7 - Free and confidential support</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="font-bold text-gray-900">Crisis Text Line</p>
              <p className="text-sm text-gray-600">Text HOME to: <span className="font-bold">741741</span></p>
              <p className="text-xs text-gray-500">24/7 - Free crisis counseling</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="font-bold text-gray-900">Emergency</p>
              <p className="text-sm text-gray-600">Call: <a href="tel:911" className="text-red-600 font-bold">911</a></p>
              <p className="text-xs text-gray-500">For immediate emergency assistance</p>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="w-full md:w-auto"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Safety Plan'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SafetyPlan;
