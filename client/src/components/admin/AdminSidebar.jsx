// client/src/components/admin/AdminSidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HiMenu, 
  HiHome, 
  HiUsers, 
  HiOfficeBuilding, 
  HiUserGroup, 
  HiClipboardList, 
  HiDocumentReport, 
  HiCreditCard, 
  HiStar 
} from 'react-icons/hi';
import loveIcon from '../../assets/loveIcon.jpg';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: HiHome },
  { name: 'Users', path: '/admin/users', icon: HiUsers },
  { name: 'Hotels', path: '/admin/hotels', icon: HiOfficeBuilding },
  { name: 'Hotel Owners', path: '/admin/hotel-owners', icon: HiUserGroup },
  { name: 'Bookings', path: '/admin/bookings', icon: HiClipboardList },
  { name: 'Reports', path: '/admin/reports', icon: HiDocumentReport },
  { name: 'Transactions', path: '/admin/transactions', icon: HiCreditCard },
  { name: 'Reviews', path: '/admin/reviews', icon: HiStar },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        {!collapsed ? (
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <img src={loveIcon} className="h-6 w-6 object-cover rounded" />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-800">Havenza</span>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </Link>
        ) : (
          <Link to="/" className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto hover:opacity-80 transition-opacity">
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
        {navItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path.endsWith('/dashboard') && location.pathname === '/admin');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
              {!collapsed && (
                <span className="font-medium text-sm">{item.name}</span>
              )}
              {!collapsed && active && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div className={`bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 ${collapsed ? 'text-center' : ''}`}>
          {!collapsed ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Need Help?</h4>
              <p className="text-xs text-gray-500">Contact support for assistance</p>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto"></div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;