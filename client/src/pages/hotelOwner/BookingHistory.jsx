import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import toast from 'react-hot-toast';
import { HiCalendar, HiUser, HiCurrencyDollar, HiFilter } from 'react-icons/hi';

const BookingHistory = () => {
  const { currency, user, getToken, axios } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/bookings/hotel', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });
      if (data?.success) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data?.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      toast.error(error?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    // Status filter
    if (filter !== 'all') {
      if (filter === 'completed' && !booking.isPaid) return false;
      if (filter === 'pending' && booking.isPaid) return false;
      if (filter === 'cancelled' && booking.status !== 'cancelled') return false;
    }

    // Date range filter
    if (dateRange !== 'all') {
      const bookingDate = new Date(booking.createdAt);
      const now = new Date();
      
      if (dateRange === 'today') {
        if (bookingDate.toDateString() !== now.toDateString()) return false;
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (bookingDate < weekAgo) return false;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (bookingDate < monthAgo) return false;
      }
    }

    return true;
  });

  const getStatusColor = (booking) => {
    if (booking.status === 'cancelled') return 'bg-red-100 text-red-800';

    if (booking.isPaid) {
      if (booking.paymentMethod === 'Stripe') return 'bg-green-100 text-green-800';
      if (booking.paymentMethod === 'Paid at Hotel') return 'bg-green-100 text-green-800';
      return 'bg-green-100 text-green-800';
    }

    const isPastCheckout = booking?.checkOutDate ? new Date(booking.checkOutDate) < new Date() : false;
    if (!booking.isPaid && isPastCheckout) return 'bg-yellow-100 text-yellow-800';

    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (booking) => {
    if (booking.status === 'cancelled') return 'Cancelled';

    if (booking.isPaid) {
      if (booking.paymentMethod === 'Stripe') return 'Completed';
      if (booking.paymentMethod === 'Paid at Hotel') return 'Paid at Hotel';
      return 'Completed';
    }

    const isPastCheckout = booking?.checkOutDate ? new Date(booking.checkOutDate) < new Date() : false;
    if (!booking.isPaid && isPastCheckout) return 'Payment Pending (Hotel)';

    return 'Pending';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateStats = () => {
    const totalRevenue = filteredBookings
      .filter(b => b.isPaid)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    const completedBookings = filteredBookings.filter(b => b.isPaid).length;
    const pendingBookings = filteredBookings.filter(b => !b.isPaid && b.status !== 'cancelled').length;
    const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled').length;

    return { totalRevenue, completedBookings, pendingBookings, cancelledBookings };
  };

  const stats = calculateStats();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const exportToCSV = () => {
    if (filteredBookings.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Guest Name', 'Guest Email', 'Room Type', 'Check-in Date', 'Check-out Date', 'Amount (INR)', 'Status', 'Booking Date'];
    const csvData = filteredBookings.map(booking => [
      booking?.user?.username || 'Guest',
      booking?.user?.email || 'N/A',
      booking?.room?.roomType || 'Room',
      booking?.checkInDate ? formatDate(booking.checkInDate) : 'N/A',
      booking?.checkOutDate ? formatDate(booking.checkOutDate) : 'N/A',
      booking?.totalPrice || 0,
      getStatusText(booking),
      booking?.createdAt ? formatDate(booking.createdAt) : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `booking_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
            <p className="text-gray-600 mt-1">Track all your bookings and manage reservations.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchBookings}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Refresh
            </button>
            <button 
              onClick={exportToCSV}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{filteredBookings.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <HiCalendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{currency} {stats.totalRevenue}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <HiCurrencyDollar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <HiFilter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Booking History ({filteredBookings.length} bookings)
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-3 text-gray-600">Loading bookings...</span>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No bookings found for the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Guest</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Room</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Check-in</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Check-out</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Booked Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking, index) => (
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
                      <p className="text-sm text-gray-900">
                        {booking?.checkInDate ? formatDate(booking.checkInDate) : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {booking?.checkOutDate ? formatDate(booking.checkOutDate) : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-gray-900">
                        {currency} {booking?.totalPrice || 0}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking)}`}>
                        {getStatusText(booking)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {booking?.createdAt ? formatDate(booking.createdAt) : 'N/A'}
                      </p>
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

export default BookingHistory;
