import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { roomsDummyData, assets, facilityIcons,roomCommonData } from '../assets/assets'; // <-- fixed import
import StartRating from '../components/StartRating';
import loveIcon from '../assets/loveIcon.jpg'
import { useAppContext } from '../context/AppContext.jsx';
import toast from 'react-hot-toast';



const RoomDetails = () => {
  const { id } = useParams();
  const {rooms,getToken,axios,navigate,currency} = useAppContext();
  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const[checkInDate,setCheckInDate]=useState(null);
  const[checkOutDate,setCheckOutDate]=useState(null);
  const[guests,setGuests]=useState(1);
  const [isAvailable,setIsAvailable]=useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [guestLimitError, setGuestLimitError] = useState('');

  // Guest limits for different room types
  const getGuestLimit = (roomType) => {
    const limits = {
      "Single Bed": 1,
      "Double Bed": 2,
      "Luxury Room": 2,
      "Family Suite": 4
    };
    return limits[roomType] || 4;
  };

  // Validate guest count
  const validateGuestCount = (guestCount, roomType) => {
    const maxGuests = getGuestLimit(roomType);
    if (guestCount > maxGuests) {
      setGuestLimitError(`This room type allows only ${maxGuests} guest${maxGuests > 1 ? 's' : ''}.`);
      return false;
    } else {
      setGuestLimitError('');
      return true;
    }
  };

  //checl availability 
  const checkAvailability=async()=>{
    try{
      if(checkInDate >= checkOutDate){
        toast.error("Check-Out date must be after Check-In date");
        return;
      }
      
      // Validate guest count
      if (!validateGuestCount(guests, room.roomType)) {
        return;
      }
      const{data} = await axios.post(`/api/bookings/check-availability`,
        {room:id,checkInDate,checkOutDate})
        if(data.success){
          if(data.isAvailable){
          setIsAvailable(true);
          toast.success("Room is available");
         
        }else{
          setIsAvailable(false);
          toast.error("Room is not available");
        }
      }else{
        toast.error(data.message);
      }
      }catch(error){
        toast.error(error.response.data.message);
        return;
      }
  }
  //handle form submit
  const onSunmitHandler=async(e)=>{
    try{
      e.preventDefault();
      
      // Validate guest count
      if (!validateGuestCount(guests, room.roomType)) {
        return;
      }
      
      if(!isAvailable){
        await checkAvailability();
        return;
      }
      else{
        const token = await getToken();
        
        console.log("Sending booking request with data:", {
          room: id,
          checkInDate,
          checkOutDate,
          guests,
          PaymentMethod: "Pay at Hotel"
        });
        
        const {data} = await axios.post(`/api/bookings/book`,
        {room:id,checkInDate,checkOutDate,guests,PaymentMethod:"Pay at Hotel"},
        {headers:{Authorization:`Bearer ${token}`}}
        );
        
        console.log("Booking response:", data);
        
        if(data.success){
          toast.success("Room booked successfully");
          navigate('/my-bookings');
          scrollTo(0,0);
        }
        else{
          toast.error(data.message);
        }
      }
    }catch(error){
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || "Booking failed");
      return;
    }
  }

  // Fetch hotel reviews
  const fetchHotelReviews = async (hotelId) => {
    try {
      setReviewsLoading(true);
      const { data } = await axios.get(`/api/reviews/hotel/${hotelId}`);
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.log("Fetch reviews error:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Helper function to render stars
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <img
        key={index}
        src={index < rating ? assets.starIconFilled : assets.starIconOutlined}
        alt="Star"
        className="w-4 h-4"
      />
    ));
  };

  // Calculate average rating
  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  useEffect(() => {
    const room = rooms.find(room => room._id === id);
    room && setRoom(room);
    room && setMainImage(room.images[0]);
    if (room && room.hotel) {
      fetchHotelReviews(room.hotel._id);
    }
  }, [rooms]);

  return room && (
    <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>
      {/* Room Details */}
      <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
        <h1 className='text-3xl md:text-4xl font-playfair'>
          {room.hotel.name} <span className='font-inter text-sm'>({room.roomType})</span>
        </h1>
        <p className='text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full'>20% OFF</p>
      </div>
      <div className='flex items-center gap-1 mt-2'>
        <div className="flex">
          {renderStars(Math.round(getAverageRating()))}
        </div>
        <p className='ml-2'>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</p>
        {reviews.length > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            {getAverageRating()}/5
          </span>
        )}
      </div>
      <div className='flex items-center gap-1 text-gray-500 mt-2'>
        <img src={assets.locationIcon} alt="location-icon" />
        <span>{room.hotel.address}</span>
      </div>
      <div className='flex flex-col lg:flex-row mt-6 gap-6'>
        <div className='lg:w-1/2 w-full'>
          <img src={mainImage} alt="Room Image"
            className='w-full rounded-xl shadow-lg object-cover' />
        </div>
        <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
          {room?.images.length > 1 && room.images.map((image, index) => (
            <img
              onClick={() => setMainImage(image)}
              key={index}
              src={image}
              alt="Room Image"
              className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === image ? 'outline-3 outline-orange-500' : ''}`}
            />
          ))}
        </div>
      </div>
      <div className='flex flex-col md:flex-row md:justify-between mt-10'>
        <div className='flex flex-col'>
            <h1 className='text-3xl md:text-4xl font-playfair'>Experience Luxury
            Like Never Before</h1>
          <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
            {room.amenities.map((item, index) => (
              <div key={index} className='flex items-center gap-2 px-3 py-2
              rounded-lg bg-gray-100'>
                <img src={facilityIcons[item]} alt={item} className='w-5
                h-5'/>
                <p className='text-xs'>{item}</p>
              </div>
                    ))}
        </div>
        </div>
        <p className='text-2xl font-medium'>{currency} {room.pricePerNight} </p>
        </div>
        <form onSubmit={onSunmitHandler} className='flex flex-col md:flex-row items-start md:items-center
        justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl'>
        <div className='flex flex-col flex-wrap md:flex-row items-start
        md:items-center gap-4 md:gap-10 text-gray-500'>
        <div className='flex flex-col'>
            <label htmlFor="checkInDate" className='font-medium'>Check-In</label>
            <input onChange={(e) => setCheckInDate(e.target.value)} 
            min={new Date().toISOString().split("T")[0]} 
            type="date" id='checkInDate' placeholder='Check-In'
            className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5
            outline-none' required/>
        </div>
        <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
        <div className='flex flex-col'>
            <label htmlFor="checkOutDate" className='font-medium'>Check-Out</label>
            <input onChange={(e) => setCheckOutDate(e.target.value)}
            min={checkInDate} disabled={!checkInDate}
            type="date" id='checkOutDate' placeholder='Check-Out'
            className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5
            outline-none' required/>
        </div>
        <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
        <div className='flex flex-col'>
            <label htmlFor="guests" className='font-medium'>Guests</label>
            <input 
              onChange={(e) => {
                const guestCount = parseInt(e.target.value) || 1;
                setGuests(guestCount);
                validateGuestCount(guestCount, room.roomType);
              }} 
              type="number" 
              id='guests' 
              placeholder='1'
              min="1"
              max={getGuestLimit(room.roomType)}
              className={`max-w-20 rounded border px-3 py-2 mt-1.5 outline-none ${
                guestLimitError ? 'border-red-500' : 'border-gray-300'
              }`} 
              required
            />
            {guestLimitError && (
              <p className="text-red-500 text-xs mt-1">{guestLimitError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Max {getGuestLimit(room.roomType)} guest{getGuestLimit(room.roomType) > 1 ? 's' : ''} for {room.roomType}
            </p>
        </div>
        </div>
       <button type="submit"
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-medium rounded-md max-md:w-full max-md:mt-6 px-24 py-3 text-base cursor-pointer shadow-md">
          {isAvailable ? 'Book Now' : 'Check Availability'}
        </button>

        </form>
        <div className='mt-24 space-y-4'>
            {roomCommonData.map((spec, index)=>(
            <div key={index} className='flex items-start gap-2'>
                <img src={spec.icon} alt={`${spec.title}-icon`} className='w-6.5'/>
                <div>
                  <p className='text-base'>{spec.title}</p>
                  <p className='text-gray-500'>{spec.description}</p>
                </div>
            </div>
        ))}
        </div>
        <div className='max-w-3x1 border-y border-gray-300 my-15 py-10 text-gray-500'>
          <p>Guests will be allocated on the ground floor according to availability. You get a comfortable Two bedroom apartment has a true city feeling. The price quoted is for two guest, at the guest slot please mark the number of guests to get the exact price for groups. The Guests will be allocated ground floor according to availability. You get the comfortable two bedroom apartment that has a true city feeling.</p>
        </div>

        <div className='flex flex-col items-start gap-4'>
        <div className='flex gap-4'>
        <img src={loveIcon} alt="Host" className='h-10 w-10
        md:h-12 md:w-18 rounded-full' />
        <div>
        <p className='text-lg md:text-xl'>Hosted by Havenza</p>
        <div className='flex items-center mt-1'>
        <div className="flex">
          {renderStars(Math.round(getAverageRating()))}
        </div>
        <p className='ml-2'>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</p>
        {reviews.length > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            {getAverageRating()}/5
          </span>
        )}
        </div>
        </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-medium rounded-lg max-md:w-full max-md:mt-4 px-6 py-2 text-base cursor-pointer shadow-md">
          Contact Now</button>
        </div>

        {/* Reviews Section */}
        <div className='mt-16 border-t border-gray-300 pt-10'>
          <div className='flex items-center justify-between mb-8'>
            <h2 className='text-2xl md:text-3xl font-playfair'>Guest Reviews</h2>
            {reviews.length > 0 && (
              <div className='flex items-center gap-2'>
                <div className="flex">
                  {renderStars(Math.round(getAverageRating()))}
                </div>
                <span className="text-lg font-semibold">{getAverageRating()}</span>
                <span className="text-gray-600">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-gray-500">Loading reviews...</div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <img src={assets.starIconOutlined} alt="No Reviews" className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">
                Be the first to share your experience at this hotel.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.slice(0, 6).map((review) => (
                <div key={review._id} className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {review.user?.image ? (
                        <img
                          src={review.user.image}
                          alt={review.user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <img src={assets.userIcon} alt="User" className="w-6 h-6" />
                      )}
                    </div>

                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {review.user?.username || "Anonymous"}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-600">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {review.room?.roomType}
                          </p>
                        </div>
                      </div>

                      {/* Review Content */}
                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {reviews.length > 6 && (
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    Showing 6 of {reviews.length} reviews
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
};

export default RoomDetails;