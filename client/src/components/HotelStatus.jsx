import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

const HotelStatus = () => {
  const location = useLocation();
  const { 
    hotelStatus, 
    setShowHotelReg, 
    showStatusPopup, 
    setShowStatusPopup, 
    setStatusPopupDismissed
  } = useAppContext();

  // Don't show popup on admin pages
  if (location.pathname.startsWith('/admin')) return null;
  
  // Debug logs
  console.log('HotelStatus Debug:', { showStatusPopup, hotelStatus, location: location.pathname });
  
  // Show popup if status is pending or rejected and popup is enabled
  if (!showStatusPopup || !hotelStatus) return null;

  const handleCancel = () => {
    setShowStatusPopup(false);
    setStatusPopupDismissed(true);
  };

  const handleReRegister = () => {
    setShowStatusPopup(false);
    setStatusPopupDismissed(true);
    setShowHotelReg(true);
  };

  if (hotelStatus === "pending") {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg shadow-lg z-50 max-w-md">
        <div className="flex items-center gap-3">
          <div className="text-2xl">⏳</div>
          <div className="flex-1">
            <h3 className="font-semibold">Hotel Registration Pending</h3>
            <p className="text-sm">👉 Your hotel registration request has been submitted. Please wait for admin approval.</p>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hotelStatus === "rejected") {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg z-50 max-w-md">
        <div className="flex items-center gap-3">
          <div className="text-2xl">❌</div>
          <div className="flex-1">
            <h3 className="font-semibold">Hotel Registration Rejected</h3>
            <p className="text-sm">👉 Your hotel registration request has been rejected.</p>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={handleReRegister}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                ✅ Re-register
              </button>
              <button 
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default HotelStatus;
