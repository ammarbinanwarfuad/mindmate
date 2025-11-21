const TimeSelector = ({ label, time, onChange }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="flex gap-2">
        <select
          value={time.hour}
          onChange={(e) => onChange({ ...time, hour: parseInt(e.target.value) })}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {hours.map(hour => (
            <option key={hour} value={hour}>
              {String(hour).padStart(2, '0')}
            </option>
          ))}
        </select>
        <span className="flex items-center text-gray-600 font-bold">:</span>
        <select
          value={time.minute}
          onChange={(e) => onChange({ ...time, minute: parseInt(e.target.value) })}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {minutes.map(minute => (
            <option key={minute} value={minute}>
              {String(minute).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-gray-500">
        {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}
        {' '}({time.hour < 12 ? 'AM' : 'PM'})
      </p>
    </div>
  );
};

export default TimeSelector;
