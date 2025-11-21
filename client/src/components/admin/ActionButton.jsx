import { useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * ActionButton Component
 * Button with confirmation dialog, loading state, and feedback
 * 
 * @param {React.ReactNode} children - Button content
 * @param {Function} onClick - Action to perform
 * @param {string} variant - Button variant (primary, danger, success, warning, secondary)
 * @param {boolean} requireConfirm - Show confirmation dialog
 * @param {string} confirmTitle - Confirmation dialog title
 * @param {string} confirmMessage - Confirmation dialog message
 * @param {string} confirmButtonText - Confirmation button text
 * @param {React.ReactNode} icon - Icon component
 * @param {boolean} disabled - Disable button
 * @param {string} className - Additional CSS classes
 * @param {boolean} showFeedback - Show success/error feedback
 */
const ActionButton = ({
  children,
  onClick,
  variant = 'primary',
  requireConfirm = false,
  confirmTitle = 'Confirm Action',
  confirmMessage = 'Are you sure you want to perform this action?',
  confirmButtonText = 'Confirm',
  icon: Icon,
  disabled = false,
  className = '',
  showFeedback = true
}) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'success' | 'error' | null

  // Variant styles
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-gray-300 hover:bg-gray-50 text-gray-700'
  };

  const handleClick = async () => {
    if (requireConfirm) {
      setShowConfirm(true);
      return;
    }
    await performAction();
  };

  const performAction = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      await onClick();
      
      if (showFeedback) {
        setFeedback('success');
        setTimeout(() => setFeedback(null), 2000);
      }
    } catch (error) {
      console.error('Action failed:', error);
      if (showFeedback) {
        setFeedback('error');
        setTimeout(() => setFeedback(null), 2000);
      }
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const buttonClasses = `
    px-4 py-2 rounded-lg font-medium transition-all
    flex items-center justify-center space-x-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]}
    ${className}
  `;

  return (
    <>
      {/* Main Button */}
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className={buttonClasses}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : feedback === 'success' ? (
          <CheckCircle className="w-4 h-4" />
        ) : feedback === 'error' ? (
          <XCircle className="w-4 h-4" />
        ) : Icon ? (
          <Icon className="w-4 h-4" />
        ) : null}
        <span>
          {loading ? 'Processing...' : 
           feedback === 'success' ? 'Success!' :
           feedback === 'error' ? 'Failed' :
           children}
        </span>
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmTitle}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmMessage}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={performAction}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  variant === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  confirmButtonText
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActionButton;
