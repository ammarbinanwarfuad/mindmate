import { useState } from 'react';
import { Eye, Copy, Trash2, Check, Image as ImageIcon } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import api from '../../utils/api';

export default function PhotosTab({ profile, photoHistory, fetchSettings }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);

  // Get all uploaded photos from photoHistory
  const photos = photoHistory || [];
  
  // Sort by upload date (newest first)
  const sortedPhotos = [...photos].sort((a, b) => 
    new Date(b.uploadedAt) - new Date(a.uploadedAt)
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    const labels = {
      'profilePicture': 'Profile Picture',
      'coverPhoto': 'Cover Photo',
      'general': 'General'
    };
    return labels[type] || 'Photo';
  };

  const handleView = (photo) => {
    setSelectedImage(photo);
    setShowViewModal(true);
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = async (photo) => {
    if (window.confirm(`Are you sure you want to delete this ${getTypeLabel(photo.type)}?`)) {
      try {
        // Delete from Cloudinary
        await api.delete('/upload/image', {
          data: { publicId: photo.publicId }
        });
        
        // Refresh settings to update photo list
        await fetchSettings();
        
        alert('Photo deleted successfully');
      } catch (error) {
        console.error('Error deleting photo:', error);
        alert(error.response?.data?.message || 'Failed to delete photo');
      }
    }
  };

  return (
    <>
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Photos</h2>
        
        {sortedPhotos.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No photos uploaded</h3>
            <p className="text-gray-600">Upload a profile picture or cover photo to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPhotos.map((photo, index) => (
              <div key={photo._id || index} className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200">
                {/* Image Container */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={getTypeLabel(photo.type)}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x400/e5e7eb/6b7280?text=Image+Not+Available';
                    }}
                  />
                  
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white bg-opacity-95 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full shadow-sm">
                      {getTypeLabel(photo.type)}
                    </span>
                  </div>

                  {/* Hover Overlay with Quick Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(photo)}
                        className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                        title="View Full Size"
                      >
                        <Eye className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleCopyUrl(photo.url)}
                        className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                        title="Copy URL"
                      >
                        {copiedUrl === photo.url ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-700" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(photo)}
                        className="p-3 bg-white rounded-full hover:bg-red-50 transition-colors shadow-lg"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Info Section */}
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 font-medium">
                      {formatDate(photo.uploadedAt)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <ImageIcon className="w-3 h-3" />
                      <span>{photo.format || 'JPG'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* View Image Modal */}
      {showViewModal && selectedImage && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title={getTypeLabel(selectedImage.type)}
        >
          <div className="space-y-4">
            {/* Full Size Image */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={selectedImage.url}
                alt={getTypeLabel(selectedImage.type)}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
            
            {/* Image Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uploaded:</span>
                <span className="text-gray-900 font-medium">{formatDate(selectedImage.uploadedAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="text-gray-900 font-medium">{getTypeLabel(selectedImage.type)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">URL:</span>
                <span className="text-gray-900 font-mono text-xs truncate max-w-xs">{selectedImage.url}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleCopyUrl(selectedImage.url)}
                variant="outline"
                fullWidth
              >
                {copiedUrl === selectedImage.url ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy URL
                  </>
                )}
              </Button>
              <Button
                onClick={() => window.open(selectedImage.url, '_blank')}
                fullWidth
              >
                <Eye className="w-4 h-4" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
