import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import toast from 'react-hot-toast';
import { HiPencilAlt, HiTrash, HiEye } from 'react-icons/hi';

const EditRooms = () => {
  const { currency, user, getToken, axios, refreshRooms } = useAppContext();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editForm, setEditForm] = useState({
    roomType: '',
    price: '',
    amenities: {
      'Free WiFi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Mountain View': false,
      'Pool Access': false
    },
    isAvailable: true
  });

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/rooms/hotel', {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });
      if (data?.success) {
        setRooms(data.rooms || []);
      } else {
        toast.error(data?.message || 'Failed to fetch rooms');
      }
    } catch (error) {
      toast.error(error?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (roomId, currentStatus) => {
    try {
      const { data } = await axios.patch(`/api/rooms/${roomId}/availability`, 
        { isAvailable: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`
          }
        }
      );
      if (data?.success) {
        toast.success(`Room ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
        fetchRooms();
      } else {
        toast.error(data?.message || 'Failed to update availability');
      }
    } catch (error) {
      toast.error(error?.message || 'Server error');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room._id);
    
    // Convert room amenities array to checkbox object
    const amenitiesObj = {
      'Free WiFi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Mountain View': false,
      'Pool Access': false
    };
    
    if (room.amenities && Array.isArray(room.amenities)) {
      room.amenities.forEach(amenity => {
        if (amenitiesObj.hasOwnProperty(amenity)) {
          amenitiesObj[amenity] = true;
        }
      });
    }
    
    setEditForm({
      roomType: room.roomType || '',
      price: room.price || '',
      amenities: amenitiesObj,
      isAvailable: room.isAvailable !== false
    });
  };

  const handleSaveEdit = async () => {
    try {
      // Convert amenities object back to array
      const selectedAmenities = Object.keys(editForm.amenities).filter(key => editForm.amenities[key]);
      
      const updateData = {
        roomType: editForm.roomType,
        price: editForm.price,
        amenities: selectedAmenities,
        isAvailable: editForm.isAvailable
      };
      
      const { data } = await axios.put(`/api/rooms/${editingRoom}`, updateData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });
      if (data?.success) {
        toast.success('Room updated successfully');
        setEditingRoom(null);
        fetchRooms();
        // Refresh the global rooms list to update filters
        refreshRooms();
      } else {
        toast.error(data?.message || 'Failed to update room');
      }
    } catch (error) {
      toast.error(error?.message || 'Server error');
    }
  };

  const handleDelete = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const { data } = await axios.delete(`/api/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });
      if (data?.success) {
        toast.success('Room deleted successfully');
        fetchRooms();
      } else {
        toast.error(data?.message || 'Failed to delete room');
      }
    } catch (error) {
      toast.error(error?.message || 'Server error');
    }
  };

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Management</h1>
            <p className="text-gray-600 mt-1">Manage your room listings, update prices, and control availability.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchRooms}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🏨</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.filter(room => room.isAvailable !== false).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unavailable</p>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.filter(room => room.isAvailable === false).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">❌</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {currency} {rooms.length > 0 ? Math.round(rooms.reduce((sum, room) => sum + (room.price || 0), 0) / rooms.length) : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Room Management</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-3 text-gray-600">Loading rooms...</span>
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No rooms found. Add some rooms to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Room Details</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amenities</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rooms.map((room, index) => (
                  <tr key={room._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden">
                          {room.images && room.images[0] ? (
                            <img 
                              src={room.images[0]} 
                              alt={room.roomType}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              🏨
                            </div>
                          )}
                        </div>
                        <div>
                          {editingRoom === room._id ? (
                            <select
                              value={editForm.roomType}
                              onChange={(e) => setEditForm({...editForm, roomType: e.target.value})}
                              className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="Single Bed">Single Bed</option>
                              <option value="Double Bed">Double Bed</option>
                              <option value="Luxury Room">Luxury Room</option>
                              <option value="Family Suite">Family Suite</option>
                            </select>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{room.roomType}</p>
                          )}
                          <p className="text-xs text-gray-500">Room #{index + 1}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingRoom === room._id ? (
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                          className="text-lg font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 w-24"
                        />
                      ) : (
                        <p className="text-lg font-bold text-gray-900">{currency} {room.price}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          room.isAvailable !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {room.isAvailable !== false ? 'Available' : 'Unavailable'}
                        </span>
                        <button
                          onClick={() => toggleAvailability(room._id, room.isAvailable !== false)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            room.isAvailable !== false 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {room.isAvailable !== false ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(room.amenities || []).slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {amenity}
                          </span>
                        ))}
                        {(room.amenities || []).length > 3 && (
                          <span className="text-xs text-gray-500">+{(room.amenities || []).length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {editingRoom === room._id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Save changes"
                            >
                              ✅
                            </button>
                            <button
                              onClick={() => setEditingRoom(null)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              ❌
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(room)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit room"
                            >
                              <HiPencilAlt className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(room._id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete room"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Form Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur bg-gray-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Room Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Room Type</label>
                <div className="grid grid-cols-1 gap-3">
                  {['Single Bed', 'Double Bed', 'Luxury Room', 'Family Suite'].map((type) => (
                    <label key={type} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="roomType"
                        value={type}
                        checked={editForm.roomType === type}
                        onChange={(e) => setEditForm({...editForm, roomType: e.target.value})}
                        className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="text-gray-700 text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ({currency})</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.keys(editForm.amenities).map((amenity) => (
                    <label key={amenity} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.amenities[amenity]}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          amenities: {
                            ...editForm.amenities,
                            [amenity]: e.target.checked
                          }
                        })}
                        className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-gray-700 text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingRoom(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditRooms;
