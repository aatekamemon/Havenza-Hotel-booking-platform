import React, { useState } from 'react';
import adminApi from '../../utils/adminApi';
import toast from 'react-hot-toast';

const HotelApprovalModal = ({ isOpen, onClose, hotel, onApproval }) => {
  const [loading, setLoading] = useState(false);

  const handleApproval = async (action) => {
    try {
      setLoading(true);
      const { data } = await adminApi.post(`/hotels/${hotel._id}/approve`, { action });
      
      if (data.success) {
        toast.success(data.message);
        onApproval();
        onClose();
      } else {
        toast.error(data.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(error.response?.data?.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !hotel) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Hotel Registration Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hotel Details */}
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Hotel Name</label>
                <p className="text-gray-900 font-medium">{hotel.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                <p className="text-gray-900">{hotel.city}</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <p className="text-gray-900">{hotel.address}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
                <p className="text-gray-900">{hotel.contact}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Registration Date</label>
                <p className="text-gray-900">{new Date(hotel.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Owner Name</label>
                <p className="text-gray-900 font-medium">{hotel.owner?.username || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-gray-900">{hotel.owner?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            onClick={() => handleApproval('reject')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Decline'}
          </button>
          
          <button
            onClick={() => handleApproval('approve')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelApprovalModal;
