import React, { useState, useEffect } from "react"
import HotelCard from './HotelCard'
import Title from './Title'
import { useAppContext } from '../context/AppContext.jsx';

const RecommendedHotels = () => {

    const {rooms,searchedCities} = useAppContext();
    const [recommended,setRecommended] = useState([]);

    const filterHotels = () => {
        const lastCity = searchedCities?.[searchedCities.length - 1] || "";
        if (!lastCity) {
            setRecommended([]);
            return;
        }
        const filtered = (rooms || []).filter(room => {
            const city = room?.hotel?.city || "";
            return city.toLowerCase() === lastCity.toLowerCase();
        });
        setRecommended(filtered);
    }

    useEffect(() => {
        filterHotels();
    }, [rooms, searchedCities]);

  return recommended.length > 0 && (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-18'>

        <Title
          title='Recommended Hotels'
          subTitle="Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences."
        />

      <div className='flex flex-wrap items-center justify-center gap-6 mt-20'>
        {recommended.slice(0,4).map((room,index)=>(
            <HotelCard key={room._id} room={room} index={index}/>
        ))}
      </div>
    </div>
  )
}

export default RecommendedHotels