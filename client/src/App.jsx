import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Footer from './components/Footer'
import AllRooms from './pages/AllRooms'
import RoomDetails from './pages/RoomDetails'
import MyBookings from './pages/MyBookings'
import HotelReg from './components/HotelReg'
import HotelStatus from './components/HotelStatus'
import Layout from './pages/hotelOwner/Layout'
import Dashboard from './pages/hotelOwner/Dashboard'
import AddRoom from './pages/hotelOwner/AddRoom'
import ListRoom from './pages/hotelOwner/ListRoom'
import Reviews from './pages/hotelOwner/Reviews'
import PendingPayments from './pages/hotelOwner/PendingPayments.jsx'
import CheckOutManager from './pages/hotelOwner/CheckOutManager.jsx'
import EditRooms from './pages/hotelOwner/EditRooms'
import BookingHistory from './pages/hotelOwner/BookingHistory'
import { Toaster } from 'react-hot-toast'
import Loader from './components/Loader'
import { useAppContext } from './context/AppContext.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import HotelsList from './pages/admin/HotelsList.jsx';
import HotelOwnersList from './pages/admin/HotelOwnersList.jsx';
import BookingsList from './pages/admin/BookingsList.jsx';
import Login from './pages/admin/Login.jsx';
import UsersList from './pages/admin/UsersLIst.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute.jsx'
import UserDetails from './pages/admin/UserDetails.jsx'
import ReviewsManagement from './pages/admin/ReviewsManagement.jsx'
import TransactionsList from './pages/admin/TransactionsList.jsx'


const App = () => {
   const pathname = useLocation().pathname;
   const isOwnerPath = pathname.includes("owner");
   const isAdminPath = pathname.startsWith("/admin");
   const {showHotelReg} = useAppContext();
  return (
    <div>
      <Toaster />
      {!isOwnerPath && !isAdminPath && <Navbar />}
      {showHotelReg && <HotelReg />}
      <HotelStatus />
      
      <div className='min-h-[70vh]'>
         <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
             <Route path='/rooms' element={<AllRooms />} />
             <Route path='/rooms/:id' element={<RoomDetails  />} />
             <Route path='/my-bookings' element={<MyBookings />} />
             <Route path='/loader/:nextUrl' element={<Loader />} />
             <Route path='/owner' element={<Layout />} >
                   <Route index element={<Dashboard />} />
                   <Route path='add-room' element={<AddRoom />} />
                   <Route path='list-room' element={<ListRoom />} />
                   <Route path='edit-rooms' element={<EditRooms />} />
                   <Route path='booking-history' element={<BookingHistory />} />
                   <Route path='pending-payments' element={<PendingPayments />} />
                   <Route path='check-out-manager' element={<CheckOutManager />} />
                   <Route path='reviews' element={<Reviews />} />
             </Route>
              
            <Route path="/admin_login" element={<Login />} />
            <Route path="/admin" element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path='dashboard' element={<AdminDashboard />} />
              <Route path="users" element={<UsersList />} />
              <Route path="users/:id" element={<UserDetails />} />
              <Route path="hotels" element={<HotelsList />} />
              <Route path="hotel-owners" element={<HotelOwnersList />} />
              <Route path="bookings" element={<BookingsList />} />
              <Route path="transactions" element={<TransactionsList />} />
              <Route path="reviews" element={<ReviewsManagement />} />
            </Route>
         </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App;