import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext.jsx'
import toast from 'react-hot-toast'

function ListRoom() {
    const [rooms, setRooms] = useState([])
    const{axios,getToken,user,currency} = useAppContext();

    const fetchRooms = async() =>{
        try{
            const {data} = await axios.get('/api/rooms/owner',{
                headers: {
                    Authorization: `Bearer ${await getToken()}`,}})
            if(data.success){
                setRooms(data.rooms);
            }   else{
                toast.error(data.message);
            }
        }catch(err){
            console.log(err);
            toast.error(error.message);
        }
    }
    const toggleAvailability = async(roomId) =>{
        const{data} = await axios.post(`/api/rooms/toggle-availability`,{roomId},{
            headers: {
                Authorization: `Bearer ${await getToken()}`,}})
            if(data.success){
                fetchRooms();
                toast.success(data.message);
            }else{
                toast.error(data.message);
            }
        }
    

    useEffect(() => {
        if(user){
            fetchRooms();
        }
    },[user]);

    const exportToCSV = () => {
        if (rooms.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = ['Room Type', 'Price (INR)', 'Status', 'Amenities'];
        const csvData = rooms.map((room, index) => [
            room.roomType,
            room.pricePerNight,
            room.isAvailable ? 'Available' : 'Unavailable',
            room.amenities.join('; ')
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `rooms_${new Date().toISOString().split('T')[0]}.csv`);
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
                        <h1 className="text-3xl font-bold text-gray-900">Room Listings</h1>
                        <p className="text-gray-600 mt-1">View, edit, and manage all your listed rooms.</p>
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
                                {rooms.filter(room => room.isAvailable).length}
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
                                {rooms.filter(room => !room.isAvailable).length}
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
                                ₹ {rooms.length > 0 ? Math.round(rooms.reduce((sum, room) => sum + room.pricePerNight, 0) / rooms.length) : 0}
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
                    <h2 className="text-xl font-semibold text-gray-900">All Rooms ({rooms.length})</h2>
                </div>

                {rooms.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🏨</span>
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-2">No rooms found</p>
                        <p>Add your first room to get started with bookings.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Room Details</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
</tr>
</thead>
                            <tbody className="divide-y divide-gray-200">
                                {rooms.map((room, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
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
                                                    <p className="text-sm font-medium text-gray-900">{room.roomType}</p>
                                                    <p className="text-xs text-gray-500">Room #{index + 1}</p>
                                                </div>
                                            </div>
            </td>
                                        <td className="px-6 py-4">
                                            <p className="text-lg font-bold text-gray-900">₹ {room.pricePerNight}</p>
                                            <p className="text-xs text-gray-500">per night</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                    room.isAvailable
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {room.isAvailable ? 'Available' : 'Unavailable'}
                                                </span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input 
                                                        onChange={() => toggleAvailability(room._id)} 
                                                        type="checkbox" 
                                                        className="sr-only peer" 
                                                        checked={room.isAvailable} 
                                                        readOnly
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-600 transition-colors duration-200"></div>
                                                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                                                </label>
                                            </div>
                                        </td>
            </tr>
                                ))}
</tbody>
</table>
                    </div>
                )}
</div>
    </div>
    )
}

export default ListRoom
