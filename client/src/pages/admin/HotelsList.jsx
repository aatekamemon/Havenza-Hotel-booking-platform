// client/src/pages/admin/HotelsList.jsx
import React, { useEffect, useState } from 'react';
import adminApi from '../../utils/adminApi';

const HotelsList = () => {
  const [hotels, setHotels] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const { data } = await adminApi.get(`/hotels?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    setHotels(Array.isArray(data.items) ? data.items : []);
    setTotal(data.total || 0);
  };

  useEffect(() => { load(); }, [page, limit, search]);

  const approve = async (id) => {
    setBusyId(id);
    try {
      await adminApi.post(`/hotels/${id}/approve`, { action: 'approve' });
      await load();
      alert('Hotel approved successfully! The owner now has dashboard access.');
    } catch (error) {
      alert('Failed to approve hotel: ' + (error.response?.data?.message || error.message));
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id) => {
    setBusyId(id);
    try {
      await adminApi.post(`/hotels/${id}/approve`, { action: 'reject' });
      await load();
      alert('Hotel rejected successfully!');
    } catch (error) {
      alert('Failed to reject hotel: ' + (error.response?.data?.message || error.message));
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hotel? This will revoke the owner\'s dashboard access immediately.')) return;
    setBusyId(id);
    try {
      await adminApi.delete(`/hotels/${id}`);
      await load();
      // Show success message
      alert('Hotel deleted successfully. The owner\'s dashboard access has been revoked.');
    } catch (error) {
      alert('Failed to delete hotel: ' + (error.response?.data?.message || error.message));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-2 md:p-4">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Hotels</h1>
        <p className="text-gray-500">Manage listings and approvals</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hotel name"
          className="border px-3 py-2 rounded-md w-full max-w-xs focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <div className="overflow-x-auto bg-white/80 backdrop-blur border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-gray-600">City</th>
              <th className="px-4 py-2 text-left text-gray-600">Owner</th>
              <th className="px-4 py-2 text-center text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {hotels.map((h, idx) => (
              <tr key={h._id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/40`}>
                <td className="px-4 py-2">{h.name}</td>
                <td className="px-4 py-2">{h.city}</td>
                <td className="px-4 py-2">{h.owner}</td>
                <td className="px-4 py-2 flex justify-center gap-2">
                  <span className="px-2 py-1 border rounded-md text-xs">{h.status || 'pending'}</span>
                  <button
                    disabled={busyId === h._id}
                    onClick={() => approve(h._id)}
                    className="px-2 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 shadow-sm disabled:opacity-60"
                  >
                    {busyId === h._id ? '...' : 'Approve'}
                  </button>
                  <button
                    disabled={busyId === h._id}
                    onClick={() => reject(h._id)}
                    className="px-2 py-1.5 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 shadow-sm disabled:opacity-60"
                  >
                    {busyId === h._id ? '...' : 'Reject'}
                  </button>
                  <button
                    disabled={busyId === h._id}
                    onClick={() => onDelete(h._id)}
                    className="px-2 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 shadow-sm disabled:opacity-60"
                  >
                    {busyId === h._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {hotels.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No hotels found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div>Page {page} of {Math.max(1, Math.ceil(total / limit))}</div>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border rounded-md disabled:opacity-50 hover:bg-gray-50">
            Prev
          </button>
          <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border rounded-md disabled:opacity-50 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelsList;