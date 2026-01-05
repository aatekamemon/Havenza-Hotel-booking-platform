import React, { useEffect, useState } from 'react';
import adminApi from '../../utils/adminApi';
import { HiSearch, HiFilter } from 'react-icons/hi';

const BookingsList = () => {
    const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const load = async () => {
  const { data } = await adminApi.get(`/bookings?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
  let items = Array.isArray(data.items) ? data.items : [];

  // fetch user and hotel names for each booking
  const enhancedItems = await Promise.all(
    items.map(async (b) => {
      let userName = b.user; // fallback
      let hotelName = b.hotel; // fallback

      try {
        const userRes = await adminApi.get(`/users/${b.user}`);
        userName = userRes.data.username || b.user;
      } catch (err) {}

      try {
        const hotelRes = await adminApi.get(`/hotels/${b.hotel}`);
        hotelName = hotelRes.data.name || b.hotel;
      } catch (err) {}

      return { ...b, userName, hotelName };
    })
  );

  setBookings(enhancedItems);
  setTotal(typeof data.total === 'number' ? data.total : 0);
};

  useEffect(() => { load() }, [page, limit, search, statusFilter, dateFilter])

  const updateStatus = async (id, status) => {
    await adminApi.put(`/bookings/${id}/status`, { status })
    load()
  }

  const exportToCSV = () => {
    if (bookings.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Guest Name', 'Hotel Name', 'Amount (INR)', 'Status', 'Booking Date'];
    const csvData = bookings.map(booking => [
      booking.userName || 'Unknown User',
      booking.hotelName || 'Unknown Hotel',
      booking.totalPrice || 0,
      booking.status || 'pending',
      new Date().toLocaleDateString() // You can replace this with actual booking date if available
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
            <p className="text-gray-600 mt-1">Track and manage all hotel bookings across the platform.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToCSV}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Search and Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
        <div className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by booking status..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={limit}
              onChange={e => setLimit(parseInt(e.target.value))}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {/* Advanced Filters */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <HiFilter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Date Range:</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {(search || statusFilter || dateFilter) && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setDateFilter('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Bookings ({total})</h2>
      </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Guest</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hotel</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((b, idx) => (
                  <tr key={b?._id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {(b.userName || 'Guest').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {typeof b.userName === 'string' ? b.userName : 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">Guest</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <span className="text-green-600 text-xl">🏨</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {typeof b.hotelName === 'string' ? b.hotelName : 'Unknown Hotel'}
                          </p>
                          <p className="text-xs text-gray-500">Hotel</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{typeof b?.totalPrice === 'number' ? b.totalPrice : 0}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        b?.status === 'completed' ? 'bg-green-100 text-green-800' :
                        b?.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        b?.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {b?.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <select
                          value={b?.status || 'pending'}
                          onChange={e => updateStatus(b._id, e.target.value)}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="booked">Booked</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                  </select>
                      </div>
                </td>
              </tr>
                ))
              )}
          </tbody>
        </table>
      </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} bookings
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Page {page} of {Math.max(1, Math.ceil(total / limit))}
              </span>
              <button
                disabled={page >= Math.ceil(total / limit)}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsList;
