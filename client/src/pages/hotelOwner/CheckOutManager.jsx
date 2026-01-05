import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import toast from 'react-hot-toast';
import { HiCalendar, HiUser } from 'react-icons/hi';

const CheckOutManager = () => {
  const { currency, user, getToken, axios } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOngoingStays = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/bookings/hotel/ongoing-stays', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });

      if (data?.success) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data?.message || 'Failed to fetch ongoing stays');
      }
    } catch (error) {
      toast.error(error?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      setUpdatingId(bookingId);
      const { data } = await axios.put(
        `/api/bookings/hotel/checkout/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`
          }
        }
      );

      if (data?.success) {
        toast.success('Guest marked as checked out');
        setBookings(prev => prev.filter(b => b._id !== bookingId));
      } else {
        toast.error(data?.message || 'Failed to update booking');
      }
    } catch (error) {
      toast.error(error?.message || 'Server error');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDateTime = (dateString) =>
    new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  useEffect(() => {
    if (user) {
      fetchOngoingStays();
    }
  }, [user]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Check-Out Manager</h1>
          <p className="text-gray-600 mt-1">
            View ongoing stays and mark guests as checked out to free up room availability.
          </p>
        </div>
        <button
          onClick={fetchOngoingStays}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Ongoing Stays ({bookings.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-3 text-gray-600">Loading ongoing stays...</span>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No ongoing stays found right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Guest
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Room
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Stay
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                          <HiUser className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking?.user?.username || 'Guest'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking?.user?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {booking?.room?.roomType || 'Room'}
                      </p>
                      <p className="text-xs text-gray-500">
                        #{booking?._id?.slice(-6) || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm text-gray-900">
                        <span>
                          Check-in:{' '}
                          {booking?.checkInDate ? formatDateTime(booking.checkInDate) : 'N/A'}
                        </span>
                        <span>
                          Check-out:{' '}
                          {booking?.checkOutDate ? formatDateTime(booking.checkOutDate) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-gray-900">
                        {currency} {booking?.totalPrice || 0}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleCheckOut(booking._id)}
                        disabled={updatingId === booking._id}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {updatingId === booking._id ? 'Updating...' : 'Mark User Checked Out'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckOutManager;


