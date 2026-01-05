import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const CancelBookingModal = ({ isOpen, onClose, booking, onCancelSuccess }) => {
  const { getToken, axios } = useAppContext();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      
      const { data } = await axios.put(`/api/bookings/cancel/${booking._id}`, 
        { reason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success('Booking cancelled successfully');
        onCancelSuccess();
        onClose();
        setReason('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur bg-gray-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Cancel Booking</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            Are you sure you want to cancel this booking?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="font-medium">{booking.hotel.name}</p>
            <p className="text-sm text-gray-600">
              {new Date(booking.checkInDate).toDateString()} - {new Date(booking.checkOutDate).toDateString()}
            </p>
            <p className="text-sm text-gray-600">Total: ${booking.totalPrice}</p>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason for cancellation *
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for cancelling this booking..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            rows="4"
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            onClick={handleCancel}
            disabled={loading || !reason.trim()}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
