import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { 
  HiHome, 
  HiPlus, 
  HiViewList, 
  HiStar, 
  HiPencilAlt, 
  HiCog, 
  HiClipboardList,
  HiMenu,
  HiUser,
  HiCurrencyDollar
} from 'react-icons/hi'
import loveIcon from '../../assets/loveIcon.jpg'

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarLinks = [
    { name: "Dashboard", path: "/owner", icon: HiHome },
    { name: "Add Room", path: "/owner/add-room", icon: HiPlus },
    { name: "List Rooms", path: "/owner/list-room", icon: HiViewList },
    { name: "Edit Management", path: "/owner/edit-rooms", icon: HiPencilAlt },
    { name: "Booking History", path: "/owner/booking-history", icon: HiClipboardList },
    { name: "Pending Payments", path: "/owner/pending-payments", icon: HiCurrencyDollar },
    { name: "Check-Out Manager", path: "/owner/check-out-manager", icon: HiClipboardList },
    { name: "Reviews", path: "/owner/reviews", icon: HiStar },
  ]

  return (
    <aside className={`h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 flex flex-col ${
      collapsed ? 'w-20' : 'w-72'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        {!collapsed ? (
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <img src={loveIcon} className="h-6 w-6 object-cover rounded" />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-800">Havenza</span>
              <p className="text-xs text-gray-500">Owner Panel</p>
            </div>
          </Link>
        ) : (
          <Link to="/" className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto hover:opacity-80 transition-opacity">
            <img src={loveIcon} className="h-6 w-6 object-cover rounded" />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <HiMenu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {sidebarLinks.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              to={item.path}
              key={index}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`
              }
              title={collapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  {!collapsed && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}
                  {!collapsed && isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div className={`bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 ${collapsed ? 'text-center' : ''}`}>
          {!collapsed ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Hotel Owner</h4>
              <p className="text-xs text-gray-500">Manage your properties</p>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto"></div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
