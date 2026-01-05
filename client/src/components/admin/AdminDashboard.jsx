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

ChartJS.register(LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement, Filler);

// Gradient Card Component
const Card = ({ title, value, icon, gradient }) => (
  <div className={`flex items-center p-5 rounded-xl shadow-md text-white ${gradient} transform hover:scale-105 transition`}>
    <div className="text-4xl mr-4">{icon}</div>
    <div>
      <p className="opacity-90">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminApi.get('/stats');
        setStats(data || {});
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

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

  const canvas1 = useRef(null);
  const canvas2 = useRef(null);

  const usersData = () => {
    const c = canvas1.current?.getContext('2d');
    const gradient = c
      ? (() => {
          const g = c.createLinearGradient(0, 0, 0, 300);
          g.addColorStop(0, 'rgba(147,197,253,0.4)');
          g.addColorStop(1, 'rgba(147,197,253,0.05)');
          return g;
        })()
      : 'rgba(147,197,253,0.2)';

    return {
      labels: months,
      datasets: [
        {
          label: 'Users',
          data: months.map((m) => (stats.usersByMonth || []).find((d) => d.month === m)?.count || 0),
          borderColor: '#2563eb',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#2563eb',
        },
      ],
    };
  };

  const bookingsData = () => {
    const c = canvas2.current?.getContext('2d');
    const userGradient = c
      ? (() => {
          const g = c.createLinearGradient(0, 0, 0, 300);
          g.addColorStop(0, 'rgba(5,150,105,0.35)');
          g.addColorStop(1, 'rgba(5,150,105,0.05)');
          return g;
        })()
      : 'rgba(5,150,105,0.2)';

    const hotelGradient = c
      ? (() => {
          const g = c.createLinearGradient(0, 0, 0, 300);
          g.addColorStop(0, 'rgba(196,181,253,0.35)');
          g.addColorStop(1, 'rgba(196,181,253,0.05)');
          return g;
        })()
      : 'rgba(196,181,253,0.15)';

    return {
      labels: months,
      datasets: [
        {
          label: 'Bookings',
          data: months.map((m) => (stats.bookingsByMonth || []).find((d) => d.month === m)?.count || 0),
          borderColor: '#059669',
          backgroundColor: userGradient,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#059669',
        },
        {
          label: 'Hotels',
          data: months.map((m) => (stats.hotelsByMonth || []).find((d) => d.month === m)?.count || 0),
          borderColor: '#7c3aed',
          backgroundColor: hotelGradient,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#7c3aed',
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
    <div className="p-2 md:p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Overview of platform activity and growth</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          title="Users"
          value={stats.totalUsers}
          icon="👥"
          gradient="bg-gradient-to-r from-blue-400 to-indigo-400"
        />
        <Card
          title="Hotels"
          value={stats.totalHotels}
          icon="🏨"
          gradient="bg-gradient-to-r from-emerald-400 to-teal-400"
        />
        <Card
          title="Bookings"
          value={stats.totalBookings}
          icon="🛎️"
          gradient="bg-gradient-to-r from-rose-400 to-pink-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 md:p-6 rounded-xl shadow hover:shadow-lg transition backdrop-blur-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Users Over Time</h2>
          <div className="h-72">
            <canvas ref={canvas1} className="hidden" />
            <Line data={usersData()} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-xl shadow hover:shadow-lg transition backdrop-blur-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Bookings & Hotels</h2>
          <div className="h-72">
            <canvas ref={canvas2} className="hidden" />
            <Line data={bookingsData()} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
