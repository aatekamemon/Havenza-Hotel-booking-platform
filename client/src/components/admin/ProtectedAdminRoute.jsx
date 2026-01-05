import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token')
  if (!token) return <Navigate to="/admin_login" replace />
  return children
}

export default ProtectedAdminRoute


