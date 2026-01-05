// client/src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import adminApi from '../../utils/adminApi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  Filler,
} from 'chart.js';
import HotelApprovalModal from '../../components/admin/HotelApprovalModal';

ChartJS.register(LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement, Filler);

const Card = ({ title, value, icon, gradient, change, changeType }) => (
  <div className={`relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className={`inline-block w-2 h-2 rounded-full ${
              changeType === 'increase' ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            {change}% from last month
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl ${gradient} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
    <div className={`absolute bottom-0 left-0 right-0 h-1 ${gradient}`}></div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalBookings: 0,
    usersByMonth: [],
    bookingsByMonth: [],
    hotelsByMonth: [],
  });
  const [pendingHotels, setPendingHotels] = useState([]);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const canvas1 = useRef(null);
  const canvas2 = useRef(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await adminApi.get('/stats');
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    const loadPendingHotels = async () => {
      try {
        const { data } = await adminApi.get('/pending-hotels');
        if (data.success && data.hotels.length > 0) {
          setPendingHotels(data.hotels);
          // Show the first pending hotel automatically
          setSelectedHotel(data.hotels[0]);
          setApprovalModalOpen(true);
        }
      } catch (err) {
        console.error('Failed to load pending hotels:', err);
      }
    };
    loadPendingHotels();
  }, []);

  const handleApproval = () => {
    // Remove the approved/rejected hotel from the list
    setPendingHotels(prev => prev.slice(1));
    
    // If there are more pending hotels, show the next one
    if (pendingHotels.length > 1) {
      setSelectedHotel(pendingHotels[1]);
    } else {
      setApprovalModalOpen(false);
      setSelectedHotel(null);
    }
  };

  const months = useMemo(
    () =>
      Array.from(
        new Set([
          ...(stats.usersByMonth || []).map((d) => d.month),
          ...(stats.bookingsByMonth || []).map((d) => d.month),
          ...(stats.hotelsByMonth || []).map((d) => d.month),
        ])
      ).sort(),
    [stats]
  );

  const usersData = () => {
    const c = canvas1.current?.getContext('2d');
    const gradient = c
      ? (() => {
          const g = c.createLinearGradient(0, 0, 0, 300);
          g.addColorStop(0, 'rgba(59,130,246,0.5)');
          g.addColorStop(1, 'rgba(59,130,246,0.05)');
          return g;
        })()
      : 'rgba(59,130,246,0.2)';

    return {
      labels: months,
      datasets: [
        {
          label: 'Users',
          data: months.map((m) => (stats.usersByMonth || []).find((d) => d.month === m)?.count || 0),
          borderColor: '#3B82F6',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#3B82F6',
        },
      ],
    };
  };

  const bookingsData = () => {
    const c = canvas2.current?.getContext('2d');
    const bookingGradient = c
      ? (() => {
          const g = c.createLinearGradient(0, 0, 0, 300);
          g.addColorStop(0, 'rgba(16,185,129,0.5)');
          g.addColorStop(1, 'rgba(16,185,129,0.05)');
          return g;
        })()
      : 'rgba(16,185,129,0.2)';

    const hotelGradient = c
      ? (() => {
          const g = c.createLinearGradient(0, 0, 0, 300);
          g.addColorStop(0, 'rgba(168,85,247,0.5)');
          g.addColorStop(1, 'rgba(168,85,247,0.05)');
          return g;
        })()
      : 'rgba(168,85,247,0.15)';

    return {
      labels: months,
      datasets: [
        {
          label: 'Bookings',
          data: months.map((m) => (stats.bookingsByMonth || []).find((d) => d.month === m)?.count || 0),
          borderColor: '#10B981',
          backgroundColor: bookingGradient,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#10B981',
        },
        {
          label: 'Hotels',
          data: months.map((m) => (stats.hotelsByMonth || []).find((d) => d.month === m)?.count || 0),
          borderColor: '#A855F7',
          backgroundColor: hotelGradient,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#A855F7',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { boxWidth: 12, color: '#374151', font: { weight: 500 } } },
      tooltip: { backgroundColor: 'rgba(17,24,39,0.9)', padding: 10, borderWidth: 0, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { color: 'rgba(156,163,175,0.1)' }, ticks: { color: '#4b5563' } },
      y: { grid: { color: 'rgba(156,163,175,0.1)' }, ticks: { color: '#4b5563' } },
    },
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
          change="12.5"
          changeType="increase"
        />
        <Card
          title="Total Hotels"
          value={stats.totalHotels}
          icon="🏨"
          gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
          change="8.2"
          changeType="increase"
        />
        <Card
          title="Total Bookings"
          value={stats.totalBookings}
          icon="🛎️"
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
          change="15.3"
          changeType="increase"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Users Growth</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              New Users
            </div>
          </div>
          <div className="h-72">
            <canvas ref={canvas1} className="hidden" />
            <Line data={usersData()} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Bookings & Hotels</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Bookings
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                Hotels
              </div>
            </div>
          </div>
          <div className="h-72">
            <canvas ref={canvas2} className="hidden" />
            <Line data={bookingsData()} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Hotel Approval Modal */}
      <HotelApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        hotel={selectedHotel}
        onApproval={handleApproval}
      />
    </div>
  );
};

export default AdminDashboard;
