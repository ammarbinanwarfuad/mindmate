import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatCard Component
 * Reusable card for displaying statistics
 * 
 * @param {React.ReactNode} icon - Icon component to display
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {string} subtitle - Optional subtitle text
 * @param {number} trend - Trend percentage (positive/negative)
 * @param {string} trendLabel - Label for trend (e.g., "vs last month")
 * @param {string} variant - Color variant (default, primary, success, warning, danger, info)
 * @param {boolean} loading - Show loading state
 * @param {Function} onClick - Optional click handler
 */
const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  variant = 'default',
  loading = false,
  onClick
}) => {
  // Color variants
  const variants = {
    default: {
      bg: 'bg-white',
      border: 'border-gray-200',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      title: 'text-gray-600',
      value: 'text-gray-900'
    },
    primary: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-200',
      iconBg: 'bg-purple-600',
      iconColor: 'text-white',
      title: 'text-purple-600',
      value: 'text-purple-900'
    },
    success: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      border: 'border-green-200',
      iconBg: 'bg-green-600',
      iconColor: 'text-white',
      title: 'text-green-600',
      value: 'text-green-900'
    },
    warning: {
      bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-600',
      iconColor: 'text-white',
      title: 'text-yellow-600',
      value: 'text-yellow-900'
    },
    danger: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100',
      border: 'border-red-200',
      iconBg: 'bg-red-600',
      iconColor: 'text-white',
      title: 'text-red-600',
      value: 'text-red-900'
    },
    info: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-200',
      iconBg: 'bg-blue-600',
      iconColor: 'text-white',
      title: 'text-blue-600',
      value: 'text-blue-900'
    }
  };

  const colors = variants[variant] || variants.default;

  // Trend icon and color
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div
      className={`${colors.bg} rounded-lg p-6 border ${colors.border} transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        {Icon && (
          <div className={`p-2 rounded-lg ${colors.iconBg}`}>
            <Icon className={`w-6 h-6 ${colors.iconColor}`} />
          </div>
        )}
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
          </div>
        )}
      </div>

      {/* Title */}
      <p className={`text-sm font-medium ${colors.title} mb-1`}>
        {title}
      </p>

      {/* Value */}
      {loading ? (
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      ) : (
        <p className={`text-3xl font-bold ${colors.value}`}>
          {value}
        </p>
      )}

      {/* Subtitle or Trend */}
      {(subtitle || trend !== undefined) && (
        <div className="mt-2 flex items-center justify-between">
          {subtitle && (
            <p className="text-xs text-gray-600">
              {subtitle}
            </p>
          )}
          {trend !== undefined && trendLabel && (
            <p className={`text-xs ${getTrendColor()}`}>
              {trend > 0 ? '+' : ''}{trend}% {trendLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
