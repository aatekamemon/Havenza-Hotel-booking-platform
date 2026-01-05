import React, { useEffect } from 'react'
import Navbar from '../../components/hotelOwner/Navbar'
import Sidebar from '../../components/hotelOwner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext.jsx'

const Layout = () => {
  const {isOwner, navigate, hotelStatus, checkHotelStatus} = useAppContext();

  useEffect(() => {
    // Check hotel status on mount and periodically
    const checkStatus = async () => {
      await checkHotelStatus();
    };
    
    checkStatus();
    
    // Set up interval to check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, [checkHotelStatus]);

  useEffect(() => {
    // Redirect if not owner or if hotel is deleted/rejected
    if(!isOwner || hotelStatus === null || hotelStatus === "rejected"){
      navigate('/')
    }
  },[isOwner, hotelStatus, navigate]);

  // Show loading or redirect message if not owner
  if(!isOwner || hotelStatus === null || hotelStatus === "rejected"){
    return (
      <div className='flex flex-col min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>Access Denied</h2>
          <p className='text-gray-600 mb-4'>Your hotel has been deleted or rejected. You no longer have access to the owner dashboard.</p>
          <button 
            onClick={() => navigate('/')}
            className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar/>
      <div className='flex flex-1'>
        <Sidebar/>
        <div className='flex-1 overflow-auto'>
            <Outlet/>
        </div>
      </div>
    </div>
  )
}

export default Layout
