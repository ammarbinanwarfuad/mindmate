import { useState } from 'react';
import TimeSelector from './TimeSelector';

const QuietHoursSelector = ({ quietHours, onChange }) => {
  const [localQuietHours, setLocalQuietHours] = useState(quietHours);

  const handleChange = (field, value) => {
    const updated = { ...localQuietHours, [field]: value };
    setLocalQuietHours(updated);
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">🌙 Quiet Hours</h3>
          <p className="text-sm text-gray-600">Pause notifications during specific hours</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localQuietHours.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {localQuietHours.enabled && (
        <div className="space-y-4">
          <TimeSelector
            label="Start Time"
            time={localQuietHours.startTime}
            onChange={(time) => handleChange('startTime', time)}
          />
          <TimeSelector
            label="End Time"
            time={localQuietHours.endTime}
            onChange={(time) => handleChange('endTime', time)}
          />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 Notifications will be paused from{' '}
              {String(localQuietHours.startTime.hour).padStart(2, '0')}:
              {String(localQuietHours.startTime.minute).padStart(2, '0')} to{' '}
              {String(localQuietHours.endTime.hour).padStart(2, '0')}:
              {String(localQuietHours.endTime.minute).padStart(2, '0')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuietHoursSelector;
