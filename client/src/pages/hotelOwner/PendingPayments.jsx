import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import toast from 'react-hot-toast';
import { HiCurrencyDollar, HiUser, HiCalendar } from 'react-icons/hi';

const PendingPayments = () => {
  const { currency, user, getToken, axios } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/bookings/hotel/pending-payments', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });

      if (data?.success) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data?.message || 'Failed to fetch pending payments');
      }
    } catch (error) {
      toast.error(error?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (bookingId) => {
    try {
      setUpdatingId(bookingId);
      const { data } = await axios.put(
        `/api/bookings/hotel/mark-paid/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`
          }
        }
      );

      if (data?.success) {
        toast.success('Marked as Paid at Hotel');
        setBookings(prev => prev.filter(b => b._id !== bookingId));
      } else {
        toast.error(data?.message || 'Failed to update payment');
      }
    } catch (error) {
      toast.error(error?.message || 'Server error');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  useEffect(() => {
    if (user) {
      fetchPendingPayments();
    }
  }, [user]);

  const totalDue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Payments</h1>
          <p className="text-gray-600 mt-1">
            Manage guests who chose to pay at the hotel but are not yet marked as paid.
          </p>
        </div>
        <button
          onClick={fetchPendingPayments}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount Due</p>
              <p className="text-2xl font-bold text-gray-900">
                {currency} {totalDue}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <HiCurrencyDollar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Overdue Hotel Payments ({bookings.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-3 text-gray-600">Loading pending payments...</span>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No pending hotel payments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Room
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Stay
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Amount Due
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
                          {booking?.checkInDate ? formatDate(booking.checkInDate) : 'N/A'}
                        </span>
                        <span>
                          Check-out:{' '}
                          {booking?.checkOutDate ? formatDate(booking.checkOutDate) : 'N/A'}
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
                        onClick={() => handleMarkPaid(booking._id)}
                        disabled={updatingId === booking._id}
                        className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {updatingId === booking._id ? 'Updating...' : 'Mark as Paid at Hotel'}
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

export default PendingPayments;


