import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../utils/adminApi';

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // For View Modal
  const [viewUser, setViewUser] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  const load = async () => {
    const { data } = await adminApi.get(
      `/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    );
    setUsers(Array.isArray(data.items) ? data.items : []);
    setTotal(data.total || 0);
  };

  useEffect(() => {
    load();
  }, [page, limit, search]);

  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeletingId(id);
    try {
      await adminApi.delete(`/users/${id}`);
      await load();
    } finally {
      setDeletingId(null);
    }
  };

  const onView = async (id) => {
    setLoadingView(true);
    try {
      const { data } = await adminApi.get(`/users/${id}`);
      setViewUser(data);
    } catch (err) {
      alert('Failed to load user details');
    } finally {
      setLoadingView(false);
    }
  };

  return (
    <div className="p-2 md:p-4">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
        <p className="text-gray-500">Manage your platform users</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email"
          className="border px-3 py-2 rounded-md w-full max-w-xs focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <div className="overflow-x-auto bg-white/80 backdrop-blur border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-gray-600">Email</th>
              <th className="px-4 py-2 text-left text-gray-600">Role</th>
              <th className="px-4 py-2 text-center text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u, idx) => (
              <tr
                key={u._id}
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/40`}
              >
                <td className="px-4 py-2">{u.username}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2 flex justify-center gap-2">
                  <button
                    onClick={() => onView(u._id)}
                    className="px-2 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 shadow-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/admin/users/${u._id}`)}
                    className="px-2 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    disabled={deletingId === u._id}
                    onClick={() => onDelete(u._id)}
                    className="px-2 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 shadow-sm disabled:opacity-60"
                  >
                    {deletingId === u._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div>
          Page {page} of {Math.max(1, Math.ceil(total / limit))}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border rounded-md disabled:opacity-50 hover:bg-gray-50"
          >
            Prev
          </button>
          <button
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border rounded-md disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* View Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur bg-gray-90 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur border border-gray-200 p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setViewUser(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              X
            </button>
            {loadingView ? (
              <p>Loading...</p>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4">User Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1">Username</label>
                    <p>{viewUser.username}</p>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Email</label>
                    <p>{viewUser.email}</p>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Role</label>
                    <p>{viewUser.role}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
