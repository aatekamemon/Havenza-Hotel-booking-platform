import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext.jsx'
import toast from 'react-hot-toast'
import { HiUpload, HiX, HiPlus, HiSave } from 'react-icons/hi'
function AddRoom() {
    const {axios,getToken } = useAppContext();

    const [images, setImages] = useState({
        1: null,
        2: null,
        3: null,
        4: null
    })
    const [inputs, setInputs] = useState({
        roomType: '',
        pricePerNight: 0,
        amenities: {
            'Free WiFi': false,
            'Free Breakfast': false,
            'Room Service': false,
            'Mountain View': false,
            'Pool Access': false
        }
    })
    const [loading, setLoading] = useState(false);
    const onSubmitHandler = async(event) =>{
            event.preventDefault();
            if(!inputs.roomType || !inputs.pricePerNight || !inputs.amenities || !Object.values(images).some(image=>image)){
                toast.error("Please fill all the fields");
                return;
            }
            setLoading(true);
            try{
                const formData = new FormData();
                formData.append('roomType', inputs.roomType);
                formData.append('pricePerNight', inputs.pricePerNight);
                const ammenites = Object.keys(inputs.amenities).filter(key => inputs.amenities[key]);
                formData.append('amenities', JSON.stringify(ammenites));
                Object.keys(images).forEach((key) => {
                    images[key]&& 
                        formData.append('images', images[key]);
                });
                    const {data} = await axios.post('/api/rooms', formData,{
                        headers: {
                            Authorization: `Bearer ${await getToken()}`,}})
                            if(data.success){
                                toast.success(data.message);
                                setInputs({
                                    roomType: '',
                                    pricePerNight: 0,
                                    amenities: {
                                        'Free WiFi': false,
                                        'Free Breakfast': false,
                                        'Room Service': false,
                                        'Mountain View': false,
                                        'Pool Access': false
                                    }
                                });
                                setImages({1: null,2: null,3: null,4: null});
                            }else{
                                toast.error(data.message);

                }                    
            }catch(error){
                toast.error(error.message);
            }finally{
                setLoading(false);
            }
    }
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Add New Room</h1>
                <p className="text-gray-600 mt-1">Add a new room to your hotel listing with detailed information and high-quality images.</p>
            </div>

            <form onSubmit={onSubmitHandler} className="max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Room Details */}
                    <div className="space-y-6">
                        {/* Room Information Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    🏨
                                </span>
                                Room Information
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-2">
                                        Room Type *
                                    </label>
                                    <select 
                                        value={inputs.roomType} 
                                        onChange={e => setInputs({...inputs, roomType: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">Select Room Type</option>
                                        <option value="Single Bed">Single Bed</option>
                                        <option value="Double Bed">Double Bed</option>
                                        <option value="Luxury Room">Luxury Room</option>
                                        <option value="Family Suite">Family Suite</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 mb-2">
                                        Price Per Night *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            id="pricePerNight"
                                            placeholder="0.00"
                                            value={inputs.pricePerNight}
                                            onChange={e => setInputs({...inputs, pricePerNight: Number(e.target.value)})}
                                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amenities Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    ✨
                                </span>
                                Room Amenities
                            </h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.keys(inputs.amenities).map((amenity, index) => (
                                    <label key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            id={`amenities${index + 1}`}
                                            checked={inputs.amenities[amenity]}
                                            onChange={() =>
                                                setInputs({
                                                    ...inputs,
                                                    amenities: {
                                                        ...inputs.amenities,
                                                        [amenity]: !inputs.amenities[amenity]
                                                    }
                                                })
                                            }
                                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="text-gray-700 font-medium">{amenity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Images */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    📸
                                </span>
                                Room Images
                            </h2>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {Object.keys(images).map((key) => (
                                    <div key={key} className="relative group">
                                        <label htmlFor={`roomImage${key}`} className="cursor-pointer block">
                                            <div className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all group-hover:scale-105">
                                                {images[key] ? (
                                                    <img 
                                                        src={URL.createObjectURL(images[key])} 
                                                        alt={`Room ${key}`} 
                                                        className="w-full h-full object-cover rounded-xl" 
                                                    />
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <HiUpload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                                        <p className="text-gray-500 text-sm font-medium">Upload Image</p>
                                                        <p className="text-gray-400 text-xs">PNG, JPG up to 10MB</p>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id={`roomImage${key}`}
                                            hidden
                                            onChange={e => setImages({...images, [key]: e.target.files[0]})}
                                        />
                                        {images[key] && (
                                            <button
                                                type="button"
                                                onClick={() => setImages({ ...images, [key]: null })}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                            >
                                                <HiX className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                                <p className="text-sm text-blue-800">
                                    <strong>Tip:</strong> Upload high-quality images to attract more guests. The first image will be used as the main room photo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Adding Room...
                            </>
                        ) : (
                            <>
                                <HiSave className="w-5 h-5" />
                                Add Room
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
export default AddRoom
