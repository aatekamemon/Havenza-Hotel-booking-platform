import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext.jsx'
import toast from 'react-hot-toast'

const Dashboard=()=> {

  const {currency,user,getToken,axios} = useAppContext();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    bookings: []
  })

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/bookings/hotel', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });
      if (data?.success) {
        const totals = data?.dashboardData || { totalBookings: 0, totalRevenue: 0 };
        const bookings = Array.isArray(data?.bookings) ? data.bookings : [];
        setDashboardData({ ...totals, bookings });
      } else {
        toast.error(data?.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      toast.error(error?.message || 'Server error');
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const getPaymentStatus = (booking) => {
    const isPastCheckout = booking?.checkOutDate ? new Date(booking.checkOutDate) < new Date() : false;

    if (booking?.status === 'cancelled') {
      return { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' };
    }

    if (booking?.isPaid) {
      if (booking.paymentMethod === 'Stripe') {
        // Online payment completed via Stripe
        return { label: 'Completed', color: 'bg-green-100 text-green-800' };
      }
      if (booking.paymentMethod === 'Paid at Hotel') {
        return { label: 'Paid at Hotel', color: 'bg-green-100 text-green-800' };
      }
      // Any other paid method – treat as completed
      return { label: 'Completed', color: 'bg-green-100 text-green-800' };
    }

    if (!booking?.isPaid && isPastCheckout) {
      return { label: 'Payment Pending (Hotel)', color: 'bg-yellow-100 text-yellow-800' };
    }

    return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
  };

  const exportToCSV = () => {
    if (dashboardData.bookings.length === 0) {
      alert('No booking data to export');
      return;
    }

    const headers = ['Guest Name', 'Guest Email', 'Room Type', 'Total Amount (INR)', 'Payment Status', 'Booking ID'];
    const csvData = dashboardData.bookings.map(booking => {
      const status = getPaymentStatus(booking);
      return [
        booking?.user?.username || 'Guest',
        booking?.user?.email || 'N/A',
        booking?.room?.roomType || 'Room',
        booking?.totalPrice || 0,
        status.label,
        booking?._id?.slice(-6) || 'N/A'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_bookings_${new Date().toISOString().split('T')[0]}.csv`);
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your room listings, track bookings and analyze revenue—all in one place.</p>
            </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToCSV}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{dashboardData.totalBookings}</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                +12% from last month
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl bg-gradient-to-r from-blue-500 to-blue-600 group-hover:scale-110 transition-transform">
              🛎️
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{currency} {dashboardData.totalRevenue}</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                +18% from last month
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl bg-gradient-to-r from-emerald-500 to-emerald-600 group-hover:scale-110 transition-transform">
              💰
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Active Rooms</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{dashboardData.bookings?.length || 0}</p>
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                Available now
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl bg-gradient-to-r from-purple-500 to-purple-600 group-hover:scale-110 transition-transform">
              🏨
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Occupancy Rate</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">85%</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                Above average
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl bg-gradient-to-r from-orange-500 to-orange-600 group-hover:scale-110 transition-transform">
              📊
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              View All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Guest</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Room</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardData.bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No recent bookings found
                  </td>
                </tr>
              ) : (
                dashboardData.bookings.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {(item?.user?.username || 'Guest').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item?.user?.username || 'Guest'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item?.user?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {item?.room?.roomType || 'Room'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Check-in: {item?.checkInDate ? new Date(item.checkInDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-gray-900">
                     {currency} {item?.totalPrice ?? 0}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const status = getPaymentStatus(item);
                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                </tr>
                ))
              )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
