import React from 'react'
import { Link } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { HiBell, HiSearch, HiUser } from 'react-icons/hi'

const Navbar = () => {
  return (
    <div className='flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm'>
      
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search rooms, bookings..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
          <HiBell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        {/* Owner Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">Hotel Owner</p>
            <p className="text-xs text-gray-500">Property Manager</p>
          </div>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 rounded-xl",
                userButtonPopoverCard: "rounded-xl shadow-lg",
                userButtonPopoverActionButton: "rounded-lg"
              }
            }}
          />
        </div>

        {/* Quick Actions */}
        <Link 
          to="/owner/add-room"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-md transition-all duration-200 ml-2"
        >
          <span className="text-sm font-medium">Add Room</span>
        </Link>
      </div>
    </div>
  )
}

export default Navbar
